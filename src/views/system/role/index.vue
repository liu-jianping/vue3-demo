<template>
  <div class="role-page">
    <div class="toolbar">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item label="角色名称">
          <a-input v-model:value="searchForm.roleName" placeholder="请输入" allow-clear style="width: 160px" />
        </a-form-item>
        <a-form-item label="角色编码">
          <a-input v-model:value="searchForm.roleCode" placeholder="请输入" allow-clear style="width: 160px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="loadTable">查询</a-button>
            <a-button @click="resetSearch">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
      <a-button type="primary" @click="openModal()">新增</a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      row-key="id"
      bordered
      :loading="loading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="openPermissionDrawer(record)">授权</a>
            <a @click="openModal(record)">编辑</a>
            <a-popconfirm title="确定删除该角色吗？" @confirm="handleDelete(record)">
              <a class="danger">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <RolePermissionDrawer
      v-model:open="permissionDrawerOpen"
      :role-id="permissionRoleId"
      :role-name="permissionRoleName"
      @success="loadTable"
    />

    <a-modal
      v-model:open="modalVisible"
      :title="editingId ? '编辑角色' : '新增角色'"
      ok-text="确定"
      cancel-text="取消"
      @ok="submitForm"
    >
      <a-form ref="formRef" :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="角色名称" name="roleName" :rules="[{ required: true, message: '请输入角色名称' }]">
          <a-input v-model:value="form.roleName" placeholder="角色名称" />
        </a-form-item>
        <a-form-item label="角色编码" name="roleCode" :rules="[{ required: true, message: '请输入角色编码' }]">
          <a-input v-model:value="form.roleCode" placeholder="如 admin" :disabled="!!editingId" />
        </a-form-item>
        <a-form-item label="备注" name="description">
          <a-textarea v-model:value="form.description" placeholder="备注" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { RoleRecord } from '@/types/role';
import {
  getRoleList,
  addRole,
  updateRole,
  deleteRole as apiDeleteRole,
} from '@/api/sys/role';
import RolePermissionDrawer from './components/RolePermissionDrawer.vue';

const columns = [
  { title: '角色名称', dataIndex: 'roleName', key: 'roleName', width: 160 },
  { title: '角色编码', dataIndex: 'roleCode', key: 'roleCode', width: 140 },
  { title: '备注', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '操作', key: 'action', width: 220, fixed: 'right' as const },
];

const searchForm = reactive({ roleName: '', roleCode: '' });
const dataSource = ref<RoleRecord[]>([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (t: number) => `共 ${t} 条`,
  onChange: (page: number, pageSize: number) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    loadTable();
  },
});
const modalVisible = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref<string | null>(null);
const form = ref<Partial<RoleRecord>>({ roleName: '', roleCode: '', description: '' });

const permissionDrawerOpen = ref(false);
const permissionRoleId = ref<string | null>(null);
const permissionRoleName = ref('');
function openPermissionDrawer(record: RoleRecord) {
  permissionRoleId.value = record.id;
  permissionRoleName.value = record.roleName;
  permissionDrawerOpen.value = true;
}

async function loadTable() {
  loading.value = true;
  try {
    const res = await getRoleList({
      roleName: searchForm.roleName || undefined,
      roleCode: searchForm.roleCode || undefined,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
    dataSource.value = res.records;
    pagination.total = res.total;
  } finally {
    loading.value = false;
  }
}

function resetSearch() {
  searchForm.roleName = '';
  searchForm.roleCode = '';
  pagination.current = 1;
  loadTable();
}

function openModal(record?: RoleRecord) {
  editingId.value = record?.id ?? null;
  form.value = {
    roleName: record?.roleName ?? '',
    roleCode: record?.roleCode ?? '',
    description: record?.description ?? '',
  };
  modalVisible.value = true;
}

async function submitForm() {
  try {
    await formRef.value?.validate();
    const payload = form.value;
    if (editingId.value) {
      updateRole(editingId.value, {
        roleName: payload.roleName,
        roleCode: payload.roleCode,
        description: payload.description,
      });
      message.success('修改成功');
    } else {
      addRole({
        roleName: payload.roleName!,
        roleCode: payload.roleCode!,
        description: payload.description,
      });
      message.success('新增成功');
    }
    modalVisible.value = false;
    loadTable();
  } catch (e: unknown) {
    if (e instanceof Error) message.error(e.message);
  }
}

function handleDelete(record: RoleRecord) {
  apiDeleteRole(record.id);
  message.success('删除成功');
  loadTable();
}

onMounted(() => {
  loadTable();
});
</script>

<style scoped>
.role-page {
  padding: 0;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
}
.danger {
  color: #ff4d4f;
}
</style>
