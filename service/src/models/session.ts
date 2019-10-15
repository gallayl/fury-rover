import { DefaultSession } from "@furystack/http-api/dist/Models/DefaultSession";
import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Session extends DefaultSession {
  @PrimaryColumn({ type: "varchar" })
  public sessionId!: string;

  @Column({ type: "varchar" })
  public username!: string;
}
