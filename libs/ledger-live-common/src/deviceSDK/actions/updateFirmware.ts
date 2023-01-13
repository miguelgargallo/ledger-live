//import { LockedDeviceError } from "@ledgerhq/errors";
import { DeviceId, FirmwareUpdateContext } from "@ledgerhq/types-live";
import { concat, Observable } from "rxjs";
import { scan } from "rxjs/operators";
import {
  updateFirmwareTask,
  UpdateFirmwareTaskEvent,
} from "../tasks/updateFirmware";
// import {
//   getDeviceInfoTask,
//   GetDeviceInfoTaskEvent,
// } from "../tasks/getDeviceInfo";
import {
  FullActionState,
  initialSharedActionState,
  sharedReducer,
} from "./core";

export type updateFirmwareActionArgs = {
  deviceId: DeviceId;
  updateContext: FirmwareUpdateContext;
};
// TODO: should the update context be retrieved from the app or here? we'll have to retrieve it in the app anyway
// to check if there's an available firmware

// TODO: Should we create a "general state" (scared we would end up with the same big existing state by doing this)
// for all the lockedDevice etc. to be consistent ?
// What would be in it ?
// lockedDevice (and unresponsive would be handle with lockedDevice)
// error ? meaning an action can throw an error, but it's always handled in the state ? could be interesting
// If only those, it's ok ? But what happens if we device to add a new prop to this "general state" ? We will need to add it everywhere ?

// TODO: put it somewhere else: in the type lib

export type UpdateFirmwareActionState = FullActionState<{
  // installingOsu: boolean;
  // installOsuDevicePermissionRequested: boolean; // TODO: should this all be booleans or maybe a single prop called "step"?
  // allowManagerRequested: boolean;
  step:
    | "installingOsu"
    | "flashingMcu"
    | "installOsuDevicePermissionRequested"
    | "installOsuDevicePermissionGranted"
    | "allowManagerRequested"
    | "firmwareUpdateCompleted"
    | "preparingUpdate";
  progress: number;
  error: { type: "UpdateFirmwareError"; message?: string };
  // TODO: probably we'll need old and new device info here so we can check if we want reinstall language, apps, etc
}>;

export const initialState: UpdateFirmwareActionState = {
  step: "preparingUpdate",
  progress: 0,
  ...initialSharedActionState,
};

export function updateFirmwareAction({
  deviceId,
  updateContext,
}: updateFirmwareActionArgs): Observable<UpdateFirmwareActionState> {
  // let oldDeviceInfo: DeviceInfo | undefined;

  return concat(
    // Retrieve the device info to store for future usage (i.e. reinstall the previously installed language)
    // getDeviceInfoTask({ deviceId }).pipe(
    //   tap((data) => {
    //     if (data.type === "data") {
    //       oldDeviceInfo = data.deviceInfo;
    //     }
    //   })
    // ),
    // update the firmware
    updateFirmwareTask({ deviceId, updateContext })
    // reinstall the language if needed
    // oldDeviceInfo?.languageId !== undefined && oldDeviceInfo?.languageId !== 0
    //   ? EMPTY // install language
    //   : EMPTY
  ).pipe(
    // filter out events from the get device info task
    // filter(isNotGetDeviceInfoEventPredicate),
    // reconciliate the state according to the events of the firmware update and language install tasks
    scan<UpdateFirmwareTaskEvent, UpdateFirmwareActionState>(
      (currentState, event) => {
        switch (event.type) {
          case "taskError":
            return {
              ...initialState,
              error: {
                type: "UpdateFirmwareError",
                error: event.error,
              },
            };
          case "installingOsu":
          case "flashingMcu":
            return {
              ...currentState,
              step: event.type,
              progress: event.progress,
            };
          case "allowManagerRequested":
          case "installOsuDevicePermissionRequested":
          case "installOsuDevicePermissionGranted":
          case "firmwareUpdateCompleted":
            return { ...currentState, step: event.type };
          default:
            // TODO: define a general reducer
            return {
              ...currentState,
              ...sharedReducer({
                event,
              }),
            };
        }
      },
      initialState
    )
  );
}

// const isNotGetDeviceInfoEventPredicate = (
//   e: UpdateFirmwareTaskEvent | GetDeviceInfoTaskEvent
// ): e is UpdateFirmwareTaskEvent => {
//   return e.type !== "data";
// };
