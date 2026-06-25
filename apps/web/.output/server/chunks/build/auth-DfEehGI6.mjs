import { d as defineNuxtRouteMiddleware, u as useAuth, n as navigateTo } from './server.mjs';
import 'vue';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';

const auth = defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated.value) {
    return navigateTo("/admin/login");
  }
});

export { auth as default };
//# sourceMappingURL=auth-DfEehGI6.mjs.map
