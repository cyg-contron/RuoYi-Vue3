<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="工程师" prop="servePerson">
        <el-input v-model="queryParams.servePerson" placeholder="请输入工程师" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="整改进度" prop="rectificationProgress">
        <el-select v-model="queryParams.rectificationProgress" placeholder="请选择整改进度" clearable>
          <el-option v-for="dict in rectification_progress" :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['zjazx:statement:add']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                   v-hasPermi="['zjazx:statement:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                   v-hasPermi="['zjazx:statement:remove']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['zjazx:statement:export']">
          导出
        </el-button>
      </el-col>
      <right-toolbar v-model:ShowSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="statementList" stripe border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="保单代码" width="100" align="center" prop="policyCode"/>
      <el-table-column label="投保单位" width="100" align="center" prop="policy.insuranceUnit" show-overflow-tooltip/>
      <el-table-column label="被保险人" width="100" align="center" prop="policy.insured" show-overflow-tooltip/>
      <el-table-column label="行政区域" width="130" align="center" prop="policy.area">
        <template #default="scope">
          <dict-tag :options="area" :value="scope.row.policy.area"/>
        </template>
      </el-table-column>
      <el-table-column label="详情地址" width="200" align="center" prop="policy.adress" show-overflow-tooltip/>
      <el-table-column label="行业类别" width="100" align="center" prop="policy.industryCategory" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="industry_category" :value="scope.row.policy.industryCategory"/>
        </template>
      </el-table-column>
      <el-table-column label="服务时间" align="center" prop="serveTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.serveTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工程师" align="center" prop="servePerson"/>
      <el-table-column label="服务项目" align="center" prop="serveType" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="serve_type" :value="scope.row.serveType ? scope.row.serveType.split(',') : []"
                    suffix="&nbsp;&nbsp;"/>
        </template>
      </el-table-column>
      <el-table-column label="评估结论" align="center" prop="conclusion"/>
      <el-table-column label="整改进度" align="center" prop="rectificationProgress">
        <template #default="scope">
          <dict-tag :options="rectification_progress" :value="scope.row.rectificationProgress"/>
        </template>
      </el-table-column>
      <el-table-column label="报告" width="60" align="center" prop="file" show-overflow-tooltip>
        <template #default="scope">
          <el-link :href="`${baseUrl}${scope.row.file}`" :underline="false" target="_blank">
            <svg-icon v-if="scope.row.file" icon-class="pdf" color="#ff461f"/>
            <!--            <span class="el-icon-document"> {{ getFileName(scope.row.file) }} </span>-->
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['zjazx:statement:edit']">修改
          </el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['zjazx:statement:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 添加或修改评估报告对话框 -->
    <el-dialog draggable :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">

        <el-form-item label="保单代码" prop="policyCode">
          <el-select v-if="title.indexOf('修改')" v-model="selectPolicyCode" filterable remote
                     reserve-keyword placeholder="请输入保单代码关键字" :remote-method="handleGetPolicyByCode"
                     :loading="loading" @change="selectPolicyByCode">
            <el-option v-for="item in optionsPolicyCode" :key="item.policyCode" :value="item"
                       :label="`${item.policyCode}/${item.insuranceUnit}/${item.areaName}/${item.industryCategoryName}`"/>
          </el-select>
          <div v-else class="form-disabled-full">{{ form.policyCode }}</div>
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="投保单位" prop="policy.insuranceUnit">
              <div class="form-disabled-full">{{ form.policy.insuranceUnit }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="被保险人" prop="policy.insured">
              <div class="form-disabled-full">{{ form.policy.insured }}</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="行业类别" prop="policy.industryCategory">
              <dict-tag class="form-disabled-full" :options="industry_category"
                        :value="form.policy.industryCategory"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="行政区域" prop="policy.area">
              <dict-tag class="form-disabled-full" :options="area" :value="form.policy.area"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详情地址" prop="policy.adress">
          <div class="form-disabled-full">{{ form.policy.adress }}</div>
        </el-form-item>

        <el-form-item label="服务时间" prop="serveTime">
          <el-date-picker clearable v-model="form.serveTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                          placeholder="请选择服务时间">
          </el-date-picker>
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="工程师" prop="servePerson">
              <el-input v-model="form.servePerson" placeholder="请输入工程师"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="整改进度" prop="rectificationProgress">
              <el-select v-model="form.rectificationProgress" placeholder="请选择整改进度">
                <el-option v-for="dict in rectification_progress" :key="dict.value" :label="dict.label"
                           :value="dict.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="服务项目" prop="serveType">
          <el-checkbox-group v-model="serveTypeArray" @change="changeServeType">
            <el-checkbox v-for="dict in serve_type" :key="dict.value" :label="dict.value">
              {{ dict.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="评估结论" prop="conclusion">
          <el-input v-model="form.conclusion" placeholder="请输入评估结论"/>
        </el-form-item>

        <el-form-item label="报告" prop="file">
          <file-upload v-model="form.file" :fileType="['pdf']" accept=".pdf"/>
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Statement'
}
</script>

<script setup>
import {listStatement, getStatement, delStatement, addStatement, updateStatement} from "@/api/zjazx/statement";
import {getPolicyByCode} from "@/api/zjazx/policy";
import {onMounted, onUnmounted} from "vue";

const {proxy} = getCurrentInstance();
const {
  serve_type, rectification_progress, area, industry_category
} = proxy.useDict("serve_type", "rectification_progress", "area", "industry_category");
const baseUrl = import.meta.env.VITE_APP_BASE_API;

// 评估报告表格数据
const statementList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

// 模糊搜索保单代码的数组
const optionsPolicyCode = ref([]);
// 从模糊搜索保单代码数组中选择后的对象
const selectPolicyCode = ref({});
// 服務項目的數組，用于新增與修改界面
const serveTypeArray = ref([]);

const data = reactive({
// 表单参数
  form: {policy: {}},
// 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    servePerson: null,
    serveType: null,
    rectificationProgress: null,
  },
// 表单校验
  rules: {
    policyCode: [
      {required: true, message: "保单代码不能为空", trigger: "change"}
    ],
    serveTime: [
      {required: true, message: "服务时间不能为空", trigger: "blur"}
    ],
    servePerson: [
      {required: true, message: "工程师不能为空", trigger: "blur"}
    ],
    serveType: [
      {required: true, message: "服务项目不能为空", trigger: "blur"}
    ],
    conclusion: [
      {required: true, message: "评估结论不能为空", trigger: "blur"}
    ],
    rectificationProgress: [
      {required: true, message: "整改进度不能为空", trigger: "change"}
    ],
    file: [
      {required: true, message: "报告不能为空", trigger: "blur"}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询评估报告列表 */
function getList() {
  loading.value = true;
  listStatement(queryParams.value).then(response => {
    statementList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  optionsPolicyCode.value = [], selectPolicyCode.value = {}, serveTypeArray.value = [];
  form.value = {
    statementId: null,
    policyCode: null,
    serveTime: null,
    servePerson: null,
    serveType: null,
    conclusion: null,
    rectificationProgress: null,
    file: null,
    deptId: null,
    userId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    policy: {}
  };
  proxy.resetForm("formRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.statementId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加评估报告";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const statementId = row.statementId || ids.value
  getStatement(statementId).then(response => {
    form.value = response.data;
    serveTypeArray.value = form.value.serveType.split(",");
    open.value = true;
    title.value = "修改评估报告";
  });
}

function changeServeType(val) {
  form.value.serveType = serveTypeArray.value.join(",");
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["formRef"].validate(valid => {
    if (valid) {
      if (form.value.statementId != null) {
        updateStatement(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStatement(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const statementIds = row.statementId || ids.value;
  proxy.$modal.confirm('是否确认删除保单代码为"' + statementIds + '"的数据项？').then(function () {
    return delStatement(statementIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('zjazx/statement/export', {
    ...queryParams.value
  }, `statement_${new Date().getTime()}.xlsx`)
}

/**
 * 模糊搜索保单代码
 * @param policyCode
 */
function handleGetPolicyByCode(policyCode) {
  if (!policyCode) {
    return;
  }
  getPolicyByCode(policyCode).then(response => {
    optionsPolicyCode.value = response.data;
  });
}

/**
 * 模糊搜索保单代码下拉选择事件
 * @param val
 */
function selectPolicyByCode(val) {
  form.value.policyCode = val.policyCode;
  selectPolicyCode.value = val.policyCode;
  form.value.policy = val;
}

onMounted(() => {
  getList();
})

onUnmounted(() => {
  reset()
})

</script>
<style lang='scss' scoped>
:deep(.el-select) {
  width: 100%;
}

:deep(.el-date-editor.el-input) {
  width: 100%;
}
</style>
