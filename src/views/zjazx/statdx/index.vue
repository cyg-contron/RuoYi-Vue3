<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="保障范围" prop="insuranceUnit">
        <el-date-picker clearable v-model="startEndTime" type="daterange" @change="changeStartEndTime"
                        value-format="YYYY-MM-DD" start-placeholder="开始时间" range-separator="到"
                        end-placeholder="结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-descriptions title="承保" direction="vertical" border>
      <el-descriptions-item label="承保单位" width="100">{{ dxcb.underwriterCount }}</el-descriptions-item>
      <el-descriptions-item label="保费合计（小写）" width="180">{{ dxcb.premiumIncludingTaxSum.toLocaleString() }}
      </el-descriptions-item>
      <el-descriptions-item label="保费合计（大写）">{{ convertCurrency(dxcb.premiumIncludingTaxSum) }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions title="出险" direction="vertical" border>
      <el-descriptions-item label="出险次数" width="100">{{ dxcx.size }}</el-descriptions-item>
      <el-descriptions-item label="赔付金额（小写）" width="180">{{ dxcx.accidentMoneySum }}</el-descriptions-item>
      <el-descriptions-item label="赔付金额（大写）">{{ convertCurrency(dxcx.accidentMoneySum) }}</el-descriptions-item>
    </el-descriptions>

    <el-descriptions title="服务" direction="vertical" border :column="2">
      <el-descriptions-item label="服务企业" width="100">{{ dxfw.underwriterCount }}</el-descriptions-item>
      <el-descriptions-item label="服务次数">{{ dxfw.size }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
export default {
  name: 'Statdx'
}
</script>

<script setup>
import {getDxCb, getDxFw, getDxCx,} from "@/api/zjazx/stat";
import {convertCurrency} from '@/utils/zjazjUtil'

const {proxy} = getCurrentInstance();

// 遮罩层
const loading = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 时间范围控制值
const startEndTime = ref([]);

const data = reactive({
// 查询参数
  queryParams: {
    startTime: null,
    endTime: null,
  },
  dxcb: {underwriterCount: '', premiumIncludingTaxSum: ''},
  dxfw: {underwriterCount: '', size: ''},
  dxcx: {size: '', accidentMoneySum: ''}
});

const {queryParams, dxcb, dxfw, dxcx} = toRefs(data);

/** 查询承保信息-保单管理列表 */
async function getList() {
  loading.value = true;
  const resDxCb = await getDxCb(queryParams.value);
  dxcb.value = resDxCb.data;

  const resDxFw = await getDxFw(queryParams.value);
  dxfw.value = resDxFw.data;

  const resDxCx = await getDxCx(queryParams.value);
  dxcx.value = resDxCx.data;

  loading.value = false;
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

// 时间范围控件选择事件
function changeStartEndTime(val) {
  queryParams.value.startTime = val[0];
  queryParams.value.endTime = val[1];
}

getList();

</script>

<style lang='scss' scoped>
.el-descriptions {
  margin-top: 20px;
}
</style>
