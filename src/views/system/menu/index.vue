<template>
  <div class="menu-page">
    <div class="toolbar">
      <a-button type="primary" @click="openModal()">新增菜单</a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="treeData"
      :pagination="false"
      row-key="id"
      :scroll="{ x: 700 }"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          {{ record.type === 'directory' ? '目录' : '菜单' }}
        </template>
        <template v-else-if="column.key === 'visible'">
          {{ record.visible ? '显示' : '隐藏' }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a @click="openModal(record)">编辑</a>
            <a-popconfirm title="确定删除该菜单吗？" @confirm="handleDelete(record)">
              <a class="danger">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalVisible"
      :title="editingId ? '编辑菜单' : '新增菜单'"
      ok-text="确定"
      cancel-text="取消"
      @ok="submitForm"
    >
      <a-form ref="formRef" :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="父级菜单" name="parentId">
          <a-tree-select
            v-model:value="form.parentId"
            :tree-data="parentTreeOptions"
            placeholder="不选则为顶级"
            allow-clear
            tree-default-expand-all
            :field-names="{ label: 'title', value: 'id' }"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="类型" name="type" :rules="[{ required: true }]">
          <a-radio-group v-model:value="form.type">
            <a-radio value="directory">目录</a-radio>
            <a-radio value="menu">菜单</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="名称" name="title" :rules="[{ required: true, message: '请输入名称' }]">
          <a-input v-model:value="form.title" placeholder="菜单名称" />
        </a-form-item>
        <a-form-item label="路径" name="path" :rules="[{ required: true, message: '请输入路径' }]">
          <a-input v-model:value="form.path" placeholder="如 /workbench" />
        </a-form-item>
        <a-form-item label="排序" name="sortOrder">
          <a-input-number v-model:value="form.sortOrder" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="是否显示" name="visible">
          <a-switch v-model:checked="form.visible" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { MenuRecord, MenuTreeRow } from '@/types/menu';
import {
  getMenuTreeList,
  addMenu,
  updateMenu,
  deleteMenu as apiDeleteMenu,
} from '@/api/sys/menu';
import { useMenuStore } from '@/store/modules/menu';

const menuStore = useMenuStore();

const columns = [
  { title: '名称', dataIndex: 'title', key: 'title', width: 180 },
  { title: '路径', dataIndex: 'path', key: 'path', width: 160 },
  { title: '类型', key: 'type', width: 80 },
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 70 },
  { title: '是否显示', key: 'visible', width: 90 },
  { title: '操作', key: 'action', width: 140 },
];

const treeData = ref<MenuTreeRow[]>([]);
const modalVisible = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref<string | null>(null);

const form = ref<Partial<MenuRecord>>({
  parentId: null,
  type: 'menu',
  title: '',
  path: '',
  sortOrder: 0,
  visible: true,
});

const parentTreeOptions = computed(() => {
  const list = treeData.value;
  const excludeId = editingId.value;
  function mapRow(row: MenuTreeRow): { id: string; title: string; children?: unknown[] } | null {
    if (excludeId && row.id === excludeId) return null;
    const node: { id: string; title: string; children?: unknown[] } = {
      id: row.id,
      title: row.title,
    };
    if (row.children?.length) {
      node.children = row.children.map(mapRow).filter(Boolean) as { id: string; title: string; children?: unknown[] }[];
    }
    return node;
  }
  return list.map(mapRow).filter(Boolean) as { id: string; title: string; children?: unknown[] }[];
});

function loadTable() {
  treeData.value = getMenuTreeList();
}

function openModal(record?: MenuTreeRow) {
  editingId.value = record?.id ?? null;
  form.value = {
    parentId: record?.parentId ?? null,
    type: record?.type ?? 'menu',
    title: record?.title ?? '',
    path: record?.path ?? '',
    sortOrder: record?.sortOrder ?? 0,
    visible: record?.visible ?? true,
  };
  modalVisible.value = true;
}

async function submitForm() {
  try {
    await formRef.value?.validate();
    const payload = form.value;
    if (editingId.value) {
      updateMenu(editingId.value, {
        parentId: payload.parentId ?? undefined,
        type: payload.type,
        title: payload.title,
        path: payload.path,
        sortOrder: payload.sortOrder ?? 0,
        visible: payload.visible ?? true,
      });
      message.success('修改成功');
    } else {
      addMenu({
        parentId: payload.parentId ?? null,
        type: (payload.type as 'directory' | 'menu') || 'menu',
        title: payload.title!,
        path: payload.path!,
        sortOrder: payload.sortOrder ?? 0,
        visible: payload.visible ?? true,
      });
      message.success('新增成功');
    }
    modalVisible.value = false;
    loadTable();
    menuStore.fetchMenuTree();
  } catch (_) {
    // validate failed
  }
}

function handleDelete(record: MenuTreeRow) {
  const res = apiDeleteMenu(record.id);
  if (res.ok) {
    message.success('删除成功');
    loadTable();
    menuStore.fetchMenuTree();
  } else {
    message.warning(res.message || '删除失败');
  }
}

onMounted(() => {
  loadTable();
});
</script>

<style scoped>
.menu-page {
  padding: 0;
}
.toolbar {
  margin-bottom: 16px;
}
.danger {
  color: #ff4d4f;
}
</style>
