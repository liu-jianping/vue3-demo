import type { RouteLocationRaw, Router } from 'vue-router';
import { useRouter } from 'vue-router';
import { BASE_HOME } from '@/enums/pageEnum';
import { isString } from '@/utils/is';

function handleError(e: unknown) {
  console.error(e);
}

/**
 * 页面跳转（参考 limsUI useGo）
 * @param _router 可选，传入则用该实例
 */
export function useGo(_router?: Router) {
  const router = _router ?? useRouter();
  const { push, replace } = router;
  return function go(opt: string | RouteLocationRaw = BASE_HOME, isReplace = false) {
    if (!opt) return;
    if (isString(opt)) {
      (isReplace ? replace(opt) : push(opt)).catch(handleError);
    } else {
      (isReplace ? replace(opt) : push(opt)).catch(handleError);
    }
  };
}
