<template>
  <div class="user-page">
    <div class="toolbar">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item label="用户账号">
          <a-input v-model:value="searchForm.username" placeholder="请输入" allow-clear style="width: 160px" />
        </a-form-item>
        <a-form-item label="用户姓名">
          <a-input v-model:value="searchForm.realname" placeholder="请输入" allow-clear style="width: 160px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="loadTable">查询</a-button>
            <a-button @click="resetSearch">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
      <div class="actions">
        <a-button type="primary" @click="openModal()">新增</a-button>
        <a-popconfirm
          v-if="selectedRowKeys.length"
          title="确定删除选中的用户吗？"
          @confirm="batchDelete"
        >
          <a-button danger>批量删除</a-button>
        </a-popconfirm>
      </div>
    </div>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      row-key="id"
      bordered
      :loading="loading"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '正常' : '禁用' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a @click="openModal(record)">编辑</a>
            <a-popconfirm
              v-if="record.username !== 'admin'"
              title="确定删除该用户吗？"
              @confirm="handleDelete(record)"
            >
              <a class="danger">删除</a>
            </a-popconfirm>
            <span v-else class="disabled">删除</span>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalVisible"
      :title="editingId ? '编辑用户' : '新增用户'"
      ok-text="确定"
      cancel-text="取消"
      @ok="submitForm"
    >
      <a-form ref="formRef" :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="用户账号" name="username" :rules="[{ required: true, message: '请输入用户账号' }]">
          <a-input v-model:value="form.username" placeholder="登录账号" :disabled="!!editingId" />
        </a-form-item>
        <a-form-item label="用户姓名" name="realname" :rules="[{ required: true, message: '请输入用户姓名' }]">
          <a-input v-model:value="form.realname" placeholder="姓名" />
        </a-form-item>
        <a-form-item
          v-if="!editingId"
          label="登录密码"
          name="password"
          :rules="[{ required: true, message: '请输入密码' }, { min: 6, message: '至少6位' }]"
        >
          <a-input-password v-model:value="form.password" placeholder="密码" />
        </a-form-item>
        <a-form-item v-else label="登录密码" name="password">
          <a-input-password v-model:value="form.password" placeholder="不修改请留空" />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="form.phone" placeholder="手机号" />
        </a-form-item>
        <a-form-item label="角色" name="roleIds">
          <a-select
            v-model:value="form.roleIds"
            mode="multiple"
            placeholder="请选择角色"
            :options="roleOptions"
            :field-names="{ label: 'roleName', value: 'id' }"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="2">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import type { UserRecord } from '@/types/user';
import { getAllRoles } from '@/api/sys/role';
import {
  getUserList,
  addUser,
  updateUser,
  deleteUser as apiDeleteUser,
  batchDeleteUser,
} from '@/api/sys/user';

const columns = [
  { title: '用户账号', dataIndex: 'username', key: 'username', width: 120 },
  { title: '用户姓名', dataIndex: 'realname', key: 'realname', width: 100 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' as const },
];

const roleOptions = ref<{ id: string; roleName: string }[]>([]);
const searchForm = reactive({ username: '', realname: '' });
const dataSource = ref<UserRecord[]>([]);
const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);
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
const form = ref<Partial<UserRecord>>({
  username: '',
  realname: '',
  password: '',
  phone: '',
  roleIds: [],
  status: 1,
});

async function loadTable() {
  loading.value = true;
  try {
    const res = await getUserList({
      username: searchForm.username || undefined,
      realname: searchForm.realname || undefined,
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
  searchForm.username = '';
  searchForm.realname = '';
  pagination.current = 1;
  loadTable();
}

function onSelectChange(keys: string[]) {
  selectedRowKeys.value = keys;
}

function openModal(record?: UserRecord) {
  editingId.value = record?.id ?? null;
  form.value = {
    username: record?.username ?? '',
    realname: record?.realname ?? '',
    password: '',
    phone: record?.phone ?? '',
    roleIds: record?.roleIds ? [...record.roleIds] : [],
    status: record?.status ?? 1,
  };
  modalVisible.value = true;
}

async function submitForm() {
  try {
    await formRef.value?.validate();
    const payload = form.value;
    if (editingId.value) {
      updateUser(editingId.value, {
        username: payload.username,
        realname: payload.realname,
        password: payload.password,
        phone: payload.phone,
        roleIds: payload.roleIds,
        status: payload.status,
      });
      message.success('修改成功');
    } else {
      addUser({
        username: payload.username!,
        realname: payload.realname!,
        password: payload.password,
        phone: payload.phone,
        roleIds: payload.roleIds ?? [],
        status: (payload.status as 1 | 2) ?? 1,
      });
      message.success('新增成功');
    }
    modalVisible.value = false;
    loadTable();
  } catch (e: unknown) {
    if (e instanceof Error) message.error(e.message);
  }
}

function handleDelete(record: UserRecord) {
  const res = apiDeleteUser(record.id);
  if (res.ok) {
    message.success('删除成功');
    loadTable();
  } else {
    message.warning(res.message || '删除失败');
  }
}

function batchDelete() {
  const res = batchDeleteUser(selectedRowKeys.value);
  if (res.ok) {
    message.success('删除成功');
    selectedRowKeys.value = [];
    loadTable();
  } else {
    message.warning(res.message || '删除失败');
  }
}

onMounted(async () => {
  roleOptions.value = getAllRoles();
  loadTable();
});
</script>

<style scoped>
.user-page {
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
.actions {
  display: flex;
  gap: 8px;
}
.danger {
  color: #ff4d4f;
}
.disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style>
