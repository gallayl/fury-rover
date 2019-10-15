import { freemem, totalmem, uptime } from "os";
import { cpuTemperature, currentLoad } from "systeminformation";
import { RequestAction, JsonResult } from "@furystack/http-api";

export const GetSystemLoadAction: RequestAction = async () => {
  const [cpuTemperatureValue, currentLoadValue] = await Promise.all([
    new Promise(resolve => cpuTemperature(resolve)),
    new Promise(resolve => currentLoad(resolve))
  ]);

  const responseBody = {
    freemem: freemem(),
    totalmem: totalmem(),
    uptime: uptime(),
    currentLoad: currentLoadValue,
    cpuTemperature: cpuTemperatureValue
  };

  return JsonResult(responseBody);
};
