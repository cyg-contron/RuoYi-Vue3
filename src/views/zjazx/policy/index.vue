<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="投保单位" prop="insuranceUnit">
        <el-input v-model="queryParams.insuranceUnit" placeholder="请输入投保单位" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="行业类别" prop="industryCategory">
        <el-select v-model="queryParams.industryCategory" placeholder="请选择行业类别" clearable>
          <el-option v-for="dict in industry_category" :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['zjazx:policy:add']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                   v-hasPermi="['zjazx:policy:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                   v-hasPermi="['zjazx:policy:remove']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['zjazx:policy:export']">
          导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="policyList" stripe border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="保单代码" width="100" align="center" prop="policyCode"/>
      <el-table-column label="承保单位" width="100" align="center" prop="underwriter" show-overflow-tooltip/>
      <el-table-column label="投保单位" width="100" align="center" prop="insuranceUnit" show-overflow-tooltip/>
      <el-table-column label="被保险人" width="100" align="center" prop="insured" show-overflow-tooltip/>
      <el-table-column label="行政区域" width="130" align="center" prop="area">
        <template #default="scope">
          <dict-tag :options="area" :value="scope.row.area"/>
        </template>
      </el-table-column>
      <el-table-column label="详情地址" width="200" align="center" prop="adress" show-overflow-tooltip/>
      <el-table-column label="行业类别" width="90" align="center" prop="industryCategory">
        <template #default="scope">
          <dict-tag :options="industry_category" :value="scope.row.industryCategory"/>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="投保险种" align="center" prop="insuranceType" width="110">
        <template #default="scope">
          <dict-tag :options="insurance_type" :value="scope.row.insuranceType"/>
        </template>
      </el-table-column>
      <el-table-column label="币种" align="center" prop="currency">
        <template #default="scope">
          <dict-tag :options="currency" :value="scope.row.currency"/>
        </template>
      </el-table-column>
      <el-table-column label="含税保费" align="center" prop="premiumIncludingTax"/>
      <el-table-column label="报告" align="center" prop="file" show-overflow-tooltip>
        <template #default="scope">
          <el-link :href="`${baseUrl}${scope.row.file}`" :underline="false" target="_blank">
            <span class="el-icon-document"> {{ getFileName(scope.row.file) }} </span>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['zjazx:policy:edit']">修改
          </el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['zjazx:policy:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" @pagination="getList"/>

    <!-- 添加或修改承保信息-保单管理对话框 -->
    <el-dialog draggable :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="投保单位" prop="insuranceUnit">
              <el-input v-model="form.insuranceUnit" placeholder="请输入投保单位"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="被保险人" prop="insured">
              <el-input v-model="form.insured" placeholder="请输入被保险人"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="行业类别" prop="industryCategory">
              <el-select v-model="form.industryCategory" placeholder="请选择行业类别">
                <el-option v-for="dict in industry_category" :key="dict.value" :label="dict.label"
                           :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="承保单位" prop="underwriter">
              <el-input v-model="form.underwriter" placeholder="请输入承保单位"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="保障时间" prop="startEndTime">
              <el-date-picker clearable v-model="startEndTime" type="daterange" @change="changeStartEndTime"
                              value-format="YYYY-MM-DD" start-placeholder="开始时间" range-separator="到"
                              end-placeholder="结束时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="行政区域" prop="area">
              <el-select v-model="form.area" placeholder="请选择行政区域">
                <el-option v-for="dict in area" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详情地址" prop="adress">
          <el-input v-model="form.adress" placeholder="请输入详情地址"/>
        </el-form-item>

        <el-row>
          <el-col :span="8">
            <el-form-item label="投保险种" prop="insuranceType">
              <el-select v-model="form.insuranceType" placeholder="请选择投保险种">
                <el-option v-for="dict in insurance_type" :key="dict.value" :label="dict.label"
                           :value="dict.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="币种" prop="currency">
              <el-select v-model="form.currency" placeholder="请选择币种">
                <el-option v-for="dict in currency" :key="dict.value" :label="dict.label"
                           :value="dict.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="含税保费" prop="premiumIncludingTax">
              <el-input v-model="form.premiumIncludingTax" placeholder="请输入含税保费"
                        @input="form.premiumIncludingTax=form.premiumIncludingTax.replace(/[^0-9.]/g,'')"/>
            </el-form-item>
          </el-col>
        </el-row>

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
  name: 'Policy'
}
</script>

<script setup>
import {listPolicy, getPolicy, delPolicy, addPolicy, updatePolicy} from "@/api/zjazx/policy";
import {getFileName} from '@/utils/strUtil'

const {proxy} = getCurrentInstance();
const {
  insurance_type,
  area,
  industry_category,
  currency
} = proxy.useDict("insurance_type", "area", "industry_category", "currency");
const baseUrl = import.meta.env.VITE_APP_BASE_API;

// 遮罩层
const loading = ref(false);
// 选中数组
const ids = ref([]);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 承保信息-保单管理表格数据
const policyList = ref([]);
// 弹出层标题
const title = ref("");
// 是否显示弹出层
const open = ref(false);

// 删除时的提示
const policyCodes = ref([]);
// 时间范围控制值
const startEndTime = ref([]);

const data = reactive({
// 表单参数
  form: {},
// 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    insuranceUnit: null,
    industryCategory: null,
  },
// 表单校验
  rules: {
    underwriter: [
      {required: true, message: "承保单位不能为空", trigger: "blur"}
    ],
    insuranceUnit: [
      {required: true, message: "投保单位不能为空", trigger: "blur"}
    ],
    insured: [
      {required: true, message: "被保险人不能为空", trigger: "blur"}
    ],
    area: [
      {required: true, message: "行政区域不能为空", trigger: "change"}
    ],
    adress: [
      {required: true, message: "详情地址不能为空", trigger: "blur"}
    ],
    industryCategory: [
      {required: true, message: "行业类别不能为空", trigger: "change"}
    ],
    startTime: [
      {required: true, message: "保障时间不能为空", trigger: "blur"}
    ],
    insuranceType: [
      {required: true, message: "投保险种不能为空", trigger: "change"}
    ],
    currency: [
      {required: true, message: "币种不能为空", trigger: "change"}
    ],
    premiumIncludingTax: [
      {required: true, message: "含税保费不能为空", trigger: "blur"}
    ],
    file: [
      {required: true, message: "报告不能为空", trigger: "blur"}
    ]
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询承保信息-保单管理列表 */
function getList() {
  loading.value = true;
  listPolicy(queryParams.value).then(response => {
    policyList.value = response.rows;
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
  policyCodes.value = [], startEndTime.value = [];
  form.value = {
    policyId: null,
    policyCode: null,
    underwriter: null,
    insuranceUnit: null,
    insured: null,
    area: null,
    adress: null,
    industryCategory: null,
    startTime: null,
    endTime: null,
    insuranceType: null,
    currency: null,
    premiumIncludingTax: null,
    file: null
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
  ids.value = [];
  policyCodes.value = [];
  selection.forEach(item => {
    ids.value.push(item.policyId);
    policyCodes.value.push(item.policyCode);
  })
  // ids.value = selection.map(item => item.policyId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加保单管理";
  // 下拉框默认选择第一个
  form.value.currency = currency.value[0].value;
  form.value.area = area.value[0].value;
  form.value.industryCategory = industry_category.value[0].value;
  form.value.insuranceType = insurance_type.value[0].value;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const policyId = row.policyId || ids.value
  getPolicy(policyId).then(response => {
    form.value = response.data;
    // 为时间范围的控制赋值
    startEndTime.value = [form.value.startTime, form.value.endTime]
    open.value = true;
    title.value = "修改保单管理";
  });
}

// 时间范围控件选择事件
function changeStartEndTime(val) {
  form.value.startTime = val[0];
  form.value.endTime = val[1];
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["formRef"].validate(valid => {
    if (valid) {
      if (form.value.policyId != null) {
        updatePolicy(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPolicy(form.value).then(response => {
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
  const delPolicyCodes = row.policyCode || policyCodes.value;
  proxy.$modal.confirm('是否确认删除保单管理编号为"' + delPolicyCodes + '"的数据项？').then(function () {
    const policyIds = row.policyId || ids.value;
    return delPolicy(policyIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('zjazx/policy/export', {
    ...queryParams.value
  }, `policy_${new Date().getTime()}.xlsx`)
}

getList();

</script>

<style lang='scss' scoped>
:deep(.el-select) {
  width: 100%;
}

:deep(.el-date-editor.el-input) {
  width: 100%;
}
</style>
