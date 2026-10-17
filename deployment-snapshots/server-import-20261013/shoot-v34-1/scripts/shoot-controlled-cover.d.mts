import type { StudioStore } from '../runtime/store.mjs';
export const CONTROLLED_COVER: {id:string;sourceProjectId:string;identitySha256:string;companionSha256:string;locationSha256:string;counterKey:string;limit:number;size:string;quality:string;automaticRetries:number};
export function prepareControlledCover(db:StudioStore,directory:string,contract?:typeof CONTROLLED_COVER):Promise<{id:string;projectId:string;promptHash:string;phase:string;requests:unknown[]}>;
export function dispatchControlledCover(db:StudioStore,directory:string,credentials:{channel:string;model?:string;apiKey:string;baseUrl:string;ledgerBefore:number;dispatchTotal:number;acknowledgeUncertain?:boolean},options?:{fetcher?:typeof fetch;contract?:typeof CONTROLLED_COVER}):Promise<{status:string;projectId:string;request:Record<string,unknown>;phase?:string}>;

export const CONTROLLED_PLACE: typeof CONTROLLED_COVER & {projectId:string;coverResultId:string;continuitySha256:string;shotId:string;channel:string;model:string};
export function prepareControlledContinuation(db:StudioStore,directory:string,approval:{text:string;source:string},contract?:typeof CONTROLLED_PLACE):Promise<{id:string;projectId:string;promptHash:string;phase:string;requests:unknown[]}>;

export const CONTROLLED_PORTRAIT:typeof CONTROLLED_PLACE & {previousResultId:string;previousSha256:string};
export function prepareControlledNextShot(db:StudioStore,directory:string,approval:{text:string;source:string},contract?:typeof CONTROLLED_PORTRAIT):Promise<{id:string;projectId:string;promptHash:string;phase:string;requests:unknown[]}>;

export const CONTROLLED_MOTION:typeof CONTROLLED_PORTRAIT & {previousShotId:string;approvalText:string;approvalScope:string};

export const CONTROLLED_PAUSE:typeof CONTROLLED_MOTION;

export const CONTROLLED_DETAIL:typeof CONTROLLED_PAUSE;

export const CONTROLLED_REPEAT:typeof CONTROLLED_COVER & {mode:string;channel:string;model:string;title:string;approvalText:string;expectedPromptHash:string;acceptedResults:{shotId:string;resultId:string;sha256:string}[]};
export function prepareControlledRepeat(db:StudioStore,directory:string,approval:{text:string;source:string},contract?:typeof CONTROLLED_REPEAT):ReturnType<typeof prepareControlledCover>;
