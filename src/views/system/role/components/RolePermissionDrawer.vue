<template>
  <a-drawer
    :open="props.open"
    title="角色权限配置"
    width="520"
    :footer-style="{ textAlign: 'right' }"
    @close="onClose"
  >
    <template #extra>
      <a-space>
        <a-button size="small" @click="checkAll">全选</a-button>
        <a-button size="small" @click="uncheckAll">取消全选</a-button>
        <a-button size="small" @click="expandAll">展开全部</a-button>
        <a-button size="small" @click="collapseAll">折叠全部</a-button>
      </a-space>
    </template>
    <div v-if="loading" class="drawer-loading">
      <a-spin tip="加载中..." />
    </div>
    <a-tree
      v-else
      ref="treeRef"
      v-model:checkedKeys="checkedKeys"
      v-model:expandedKeys="expandedKeys"
      checkable
      :tree-data="treeData"
      :field-names="{ key: 'key', title: 'title', children: 'children' }"
      :check-strictly="checkStrictly"
    />
    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" :loading="saveLoading" @click="handleSave">保存</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import type { RoleMenuTreeNode } from '@/api/sys/role';
import {
  getMenuTreeForRole,
  getRolePermission,
  saveRolePermission,
} from '@/api/sys/role';

const props = withDefaults(
  defineProps<{
    open: boolean;
    roleId: string | null;
    roleName?: string;
  }>(),
  { open: false }
);

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void;
  (e: 'success'): void;
}>();

const treeRef = ref();
const treeData = ref<RoleMenuTreeNode[]>([]);
const allKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);
const expandedKeys = ref<string[]>([]);
const loading = ref(false);
const saveLoading = ref(false);
/** 是否父子不关联（勾选父不自动勾选子） */
const checkStrictly = ref(false);

function collectKeys(nodes: RoleMenuTreeNode[]): string[] {
  const keys: string[] = [];
  function walk(list: RoleMenuTreeNode[]) {
    list.forEach((n) => {
      keys.push(n.key);
      if (n.children?.length) walk(n.children!);
    });
  }
  walk(nodes);
  return keys;
}

watch(
  () => [props.open, props.roleId] as const,
  async ([open, roleId]) => {
    if (!open || !roleId) {
      treeData.value = [];
      checkedKeys.value = [];
      expandedKeys.value = [];
      return;
    }
    loading.value = true;
    try {
      const tree = getMenuTreeForRole();
      treeData.value = tree;
      allKeys.value = collectKeys(tree);
      checkedKeys.value = getRolePermission(roleId);
      expandedKeys.value = [...allKeys.value];
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);

function checkAll() {
  checkedKeys.value = [...allKeys.value];
}
function uncheckAll() {
  checkedKeys.value = [];
}
function expandAll() {
  expandedKeys.value = [...allKeys.value];
}
function collapseAll() {
  expandedKeys.value = [];
}

function onClose() {
  emit('update:open', false);
}

async function handleSave() {
  if (!props.roleId) return;
  saveLoading.value = true;
  try {
    saveRolePermission(props.roleId, checkedKeys.value);
    message.success('保存成功');
    emit('success');
    onClose();
  } finally {
    saveLoading.value = false;
  }
}
</script>

<style scoped>
.drawer-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>
