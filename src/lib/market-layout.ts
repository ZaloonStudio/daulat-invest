import type {IndexQuote} from './types';
export const HOME_INDEX_CODES=['KSE100','ALLSHR','KSE30','KMI30','PSXDIV20'] as const;
export function homeIndices(indices:IndexQuote[]) {
 return HOME_INDEX_CODES.flatMap(code=>{const index=indices.find(i=>i.code===code);return index?[index]:[];});
}
