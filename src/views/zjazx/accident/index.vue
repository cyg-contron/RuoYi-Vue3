<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="保单代码" prop="policyCode">
        <el-input
            v-model="queryParams.policyCode"
            placeholder="请输入保单代码"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['zjazx:accident:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['zjazx:accident:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['zjazx:accident:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['zjazx:accident:export']"
        >导出
        </el-button>
      </el-col>

      <el-col :span="6" style="margin-left: auto;">
        <div style="display: flex; align-items: center; ">
          <span style="width: 70px;">理赔合计</span>
          <div class="form-disabled-full" style="width: 120px;">{{ accidentMoneyCount }}</div>
        </div>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="accidentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="保单代码" width="100" align="center" prop="policyCode"/>
      <el-table-column label="出险时间" width="100" align="center" prop="accidentTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.accidentTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出险地址" width="200" align="center" prop="accidentAddress" show-overflow-tooltip/>
      <el-table-column label="出险原因" width="90" align="center" prop="accidentCause" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="accident_cause" :value="scope.row.accidentCause"/>
        </template>
      </el-table-column>
      <el-table-column label="理赔币种" width="90" align="center" prop="accidentCurrency">
        <template #default="scope">
          <dict-tag :options="currency" :value="scope.row.accidentCurrency"/>
        </template>
      </el-table-column>
      <el-table-column label="理赔金额" width="120" align="center" prop="accidentMoney" show-overflow-tooltip>
        <template #default="scope">
          <div>{{ `${scope.row.accidentMoney.toLocaleString()}（${convertCurrency(scope.row.accidentMoney)}）` }}</div>
        </template>
      </el-table-column>
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
      <el-table-column label="投保险种" width="110" align="center" prop="policy.insuranceType">
        <template #default="scope">
          <dict-tag :options="insurance_type" :value="scope.row.policy.insuranceType"/>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" width="100" align="center" prop="policy.startTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.policy.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" width="100" align="center" prop="policy.endTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.policy.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="经手人" align="center" prop="handlePerson"/>
      <el-table-column label="原件" width="60" align="center" prop="file" show-overflow-tooltip>
        <template #default="scope">
          <el-link :href="`${baseUrl}${scope.row.file}`" :underline="false" target="_blank">
            <svg-icon v-if="scope.row.file" icon-class="pdf" color="#ff461f"/>
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['zjazx:accident:edit']">修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['zjazx:accident:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改理赔信息-理赔管理对话框 -->
    <el-dialog draggable :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="accidentRef" :model="form" :rules="rules" label-width="80px">
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
              <dict-tag class="form-disabled-full" :options="industry_category" :value="form.policy.industryCategory"/>
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

        <el-row>
          <el-col :span="12">
            <el-form-item label="投保险种" prop="policy.insuranceType">
              <dict-tag class="form-disabled-full" :options="insurance_type" :value="form.policy.insuranceType"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保障时间" prop="startEndTime">
              <el-date-picker disabled clearable v-model="startEndTime" type="daterange" value-format="YYYY-MM-DD"
                              range-separator="到">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="经手人" prop="handlePerson">
              <el-input v-model="form.handlePerson" placeholder="请输入经手人"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出险时间" prop="accidentTime">
              <el-date-picker clearable v-model="form.accidentTime" type="date" value-format="YYYY-MM-DD"
                              placeholder="请选择出险时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="出险地址" prop="accidentAddress">
          <el-input v-model="form.accidentAddress" placeholder="请输入出险地址"/>
        </el-form-item>

        <el-row>
          <el-col :span="8">
            <el-form-item label="出险原因" prop="accidentCause">
              <el-select v-model="form.accidentCause" placeholder="请选择出险原因">
                <el-option v-for="dict in accident_cause" :key="dict.value" :label="dict.label"
                           :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="理赔币种" prop="accidentCurrency">
              <el-select v-model="form.accidentCurrency" placeholder="请选择理赔币种">
                <el-option v-for="dict in currency" :key="dict.value" :label="dict.label"
                           :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="理赔金额" prop="accidentMoney">
              <el-input v-model="form.accidentMoney" placeholder="请输入理赔金额"
                        @input="form.accidentMoney=regexpCurrency(form.accidentMoney)"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="原件" prop="file">
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

<script setup name="Accident">
import {listAccident, getAccident, delAccident, addAccident, updateAccident} from "@/api/zjazx/accident";
import {getPolicyByCode} from "@/api/zjazx/policy";
import {regexpCurrency, convertCurrency} from '@/utils/zjazjUtil'
import {onMounted, onUnmounted} from "vue";

const {proxy} = getCurrentInstance();
const {
  accident_cause,
  currency,
  area,
  industry_category, insurance_type
} = proxy.useDict('accident_cause', 'currency', 'area', 'industry_category', 'insurance_type');
const baseUrl = import.meta.env.VITE_APP_BASE_API;

const accidentList = ref([]);
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
// 删除时的提示
const policyCodes = ref([]);
// 时间范围控制值
const startEndTime = ref([]);
// 理赔合计
const accidentMoneyCount = ref(0);

const data = reactive({
  form: {policy: {}},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    policyCode: null,
  },
  rules: {
    policyCode: [
      {required: true, message: "保单代码不能为空", trigger: "blur"}
    ],
    accidentTime: [
      {required: true, message: "出险时间不能为空", trigger: "blur"}
    ],
    accidentAddress: [
      {required: true, message: "出险地址不能为空", trigger: "blur"}
    ],
    accidentCause: [
      {required: true, message: "出险原因不能为空", trigger: "change"}
    ],
    accidentCurrency: [
      {required: true, message: "理赔币种不能为空", trigger: "change"}
    ],
    accidentMoney: [
      {
        required: true, message: "理赔金额不能为空", trigger: "blur"
      }
    ],
    handlePerson: [
      {required: true, message: "经手人不能为空", trigger: "blur"}
    ],
    file: [
      {required: true, message: "原件不能为空", trigger: "blur"}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询理赔信息-理赔管理列表 */
function getList() {
  loading.value = true;
  listAccident(queryParams.value).then(response => {
    accidentList.value = response.rows;
    accidentList.value.forEach((item => {
      accidentMoneyCount.value += item.accidentMoney;
    }))
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
  optionsPolicyCode.value = [], selectPolicyCode.value = {}, startEndTime.value = [], accidentMoneyCount.value = 0;
  form.value = {
    accidentId: null,
    policyCode: null,
    accidentTime: null,
    accidentAddress: null,
    accidentCause: null,
    accidentCurrency: null,
    accidentMoney: null,
    handlePerson: null,
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
  proxy.resetForm("accidentRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.accidentId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加理赔";
  // 下拉框默认选择第一个
  form.value.accidentCause = accident_cause.value[0].value;
  form.value.accidentCurrency = currency.value[0].value;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _accidentId = row.accidentId || ids.value
  getAccident(_accidentId).then(response => {
    form.value = response.data;
    // 为时间范围的控制赋值
    startEndTime.value = [form.value.policy.startTime, form.value.policy.endTime];
    open.value = true;
    title.value = "修改理赔理赔";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["accidentRef"].validate(valid => {
    if (valid) {
      if (form.value.accidentId != null) {
        updateAccident(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAccident(form.value).then(response => {
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
  const _accidentIds = row.accidentId || ids.value;
  proxy.$modal.confirm('是否确认删除理赔信息-理赔管理编号为"' + _accidentIds + '"的数据项？').then(function () {
    return delAccident(_accidentIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('zjazx/accident/export', {
    ...queryParams.value
  }, `accident_${new Date().getTime()}.xlsx`)
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
  // 为时间范围的控制赋值
  startEndTime.value = [val.startTime, val.endTime];
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
