import { Retrier } from "@furystack/utils";
import { Injector } from "@furystack/inject/dist/Injector";
import { Injectable } from "@furystack/inject";
import { Users } from "../odata/entity-collections";
import { SessionService } from "./session";

/**
 * Options for Google OAuth Authentication
 */
export class GoogleAuthenticationOptions {
  /**
   * Defines the Redirect Uri. Will fall back to 'window.location.origin', if not provided
   */
  public redirectUri!: string;
  /**
   * Scope settings for Google Oauth
   * Visit the following link to read more about Google Scopes:
   * https://developers.google.com/identity/protocols/googlescopes
   */
  public scope: string[] = ["email", "profile"];
  /**
   * Your application's ClientId, provided by Google
   */
  public clientId!: string;
  public windowInstance = window;
}

/**
 * Basic Google OAuth Provider implementation
 * Usage example:
 *
 * ```
 * import { AddGoogleAuth } from 'sn-client-auth-google';
 *
 * AddGoogleAuth(myRepository, {
 *      ClientId: myGoogleClientId
 * });
 *
 * // ...
 * // an example login method:
 * async Login(){
 *  try {
 *      await myRepository.Authentication.GetOauthProvider(GoogleOauthProvider).Login();
 *      console.log('Logged in');
 *  } catch (error) {
 *     console.warn('Error during login', error);
 *  }
 * }
 * ```
 *
 */
@Injectable()
export class GoogleOauthProvider {
  /**
   * Disposes the OAuth provider
   */
  public dispose() {
    this.iframe = null as any;
  }
  /**
   * Logs in the User with Google OAuth. Tries to retrieve the Token, if not provided.
   * @param { string? } token If provided, the sensenet Oauth Login endpoint will be called with this token. Otherwise it will try to get it with GetToken()
   * @returns a Promise that will be resolved after the Login request
   */
  public async login() {
    try {
      this.session.isOperationInProgress.setValue(true);
      const token = await this.getToken();
      const user = await this.usersService.googleLogin({ token });
      if (user) {
        this.session.currentUser.setValue(user);
        this.session.state.setValue("authenticated");
      }
    } finally {
      this.session.isOperationInProgress.setValue(false);
    }
  }

  private popup!: Window | null;

  /**
   * Gets the Token from a child window.
   * @param {string} loginReqUrl The Login request URL
   * @returns {Promise<string>} A promise that will be resolved with an id_token or rejected in case of any error or interruption
   */
  private async getTokenFromPrompt(loginReqUrl: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.popup = this.options.windowInstance.open(
        loginReqUrl,
        "_blank",
        "toolbar=no,scrollbars=no,resizable=no,top=200,left=300,width=400,height=400",
        true
      );
      const timer = setInterval(() => {
        if (this.popup && this.popup.window) {
          try {
            if (this.popup.window.location.href !== loginReqUrl) {
              const token = this.getGoogleTokenFromUri(
                this.popup.window.location
              );
              if (token) {
                resolve(token);
                this.popup.close();
                clearInterval(timer);
              }
            }
          } catch (error) {
            /** cross-origin */
          }
        } else {
          // Popup closed
          reject(Error("The popup has been closed"));
          clearInterval(timer);
        }
      }, 50);
    });
  }

  private iframe!: HTMLIFrameElement;

  /**
   * Tries to retrieve an id_token w/o user interaction
   * @param loginUrl the login Url
   * @returns {Promise<string>} A promise that will be resolved with a token or rejected if cannot get the Token silently.
   */
  private async getTokenSilent(loginUrl: string): Promise<string> {
    if (this.iframe) {
      throw Error("Getting token already in progress");
    }

    const token = await new Promise<string>((resolve, reject) => {
      this.iframe = this.options.windowInstance.document.createElement(
        "iframe"
      );
      this.iframe.style.display = "none";
      this.iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");

      this.iframe.onload = async ev => {
        let location: Location | null = null;
        await Retrier.create(async () => {
          try {
            // eslint-disable-next-line prefer-destructuring
            location = ((ev.srcElement as HTMLIFrameElement)
              .contentDocument as Document).location;
            return true;
          } catch (error) {
            return false;
          }
        })
          .setup({
            timeoutMs: 500
          })
          .run();

        const iframeToken = location && this.getGoogleTokenFromUri(location);
        iframeToken ? resolve(iframeToken) : reject(Error("Token not found"));
        this.options.windowInstance.document.body.removeChild(this.iframe);
        this.iframe = undefined as any;
      };
      this.iframe.src = loginUrl;
      this.options.windowInstance.document.body.appendChild(this.iframe);
    });

    return token;
  }

  /**
   * Tries to retrieve a valid Google id_token
   * @returns {Promise<string>} A promise that will be resolved with an id_token, or will be rejected in case of errors or if the dialog closes
   */
  public async getToken(): Promise<string> {
    const loginReqUrl = this.getGoogleLoginUrl();
    try {
      return await this.getTokenSilent(loginReqUrl);
    } catch (error) {
      /** Cannot get token */
    }
    return await this.getTokenFromPrompt(loginReqUrl);
  }

  /**
   * Gets a Google OAuth2 Login window URL based on the provider options
   * @returns {string} the generated Url
   */
  public getGoogleLoginUrl(): string {
    return (
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?response_type=id_token` +
      `&redirect_uri=${encodeURIComponent(this.options.redirectUri)}` +
      `&scope=${encodeURIComponent(this.options.scope.join(" "))}` +
      `&client_id=${encodeURIComponent(this.options.clientId)}` +
      `&nonce=${Math.random().toString()}`
    );
  }

  /**
   * Extracts an id_token from a provided Location
   * @param { Location } uri The Location uri with the hashed id_token to be extracted
   * @returns { string | null } The extracted id_token
   */
  public getGoogleTokenFromUri(uri: Location): string | null {
    const tokenSegmentPrefix = "#id_token=";
    const tokenSegment = uri.hash
      .split("&")
      .find(segment => segment.indexOf(tokenSegmentPrefix) === 0);
    if (tokenSegment) {
      return tokenSegment.replace(tokenSegmentPrefix, "");
    }
    return null;
  }

  /**
   *
   * @param {BaseRepository} _repository the Repository instance
   * @param {GoogleAuthenticationOptions} _options Additional options for the Provider
   */
  constructor(
    private readonly options: GoogleAuthenticationOptions,
    private readonly usersService: Users,
    private readonly session: SessionService
  ) {}
}

declare module "@furystack/inject/dist/Injector" {
  interface Injector {
    useGoogleAuth(
      options: Partial<GoogleAuthenticationOptions> & { clientId: string }
    ): Injector;
  }
}

Injector.prototype.useGoogleAuth = function(
  options: GoogleAuthenticationOptions
) {
  const newOptions = new GoogleAuthenticationOptions();

  if (!options.redirectUri) {
    options.redirectUri = `${window.location.origin}/`;
  }
  this.setExplicitInstance(
    Object.assign(newOptions, options),
    GoogleAuthenticationOptions
  );
  return this;
};
