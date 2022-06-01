<template>
  <div
    id="app"
    class="container"
    ref="app"
    :class="{
      funds: tab_name === 'second',
    }"
  >
    <el-tabs type="border-card" v-model="tab_name">
      <el-tab-pane label="加班时长" name="first">
        <div v-if="staff_id && !staff_expired" class="query_wrap">
          <div class="query_head">
            <el-date-picker
              format="yyyy-MM"
              value-format="yyyy-MM"
              v-model="work_date"
              type="month"
            >
            </el-date-picker>
            <div style="line-height: 40px">
              <el-button
                type="primary"
                :loading="loading"
                size="small"
                @click="startCalc()"
                >查询</el-button
              >
            </div>
          </div>
          <div class="query_detail">
            <p class="query_total">
              {{ work_date }}月加班总时长：
              <el-tooltip
                class="item"
                effect="dark"
                :content="tip_content"
                placement="bottom-start"
              >
                <span>
                  <countTo
                    :start-val="Number(staff_count_before_transtohour)"
                    :end-val="Number(staff_count_transtohour)"
                    :duration="3000"
                    :decimals="2"
                    :autoplay="true"
                  />小时 /
                  <countTo
                    :start-val="Number(staff_count_before)"
                    :end-val="Number(staff_count)"
                    :duration="3000"
                    :decimals="0"
                    :autoplay="true"
                  />分钟
                </span>
              </el-tooltip>
            </p>
            <p v-for="(item, index) in work_list" :key="index">
              {{ item.date }}：{{ item.time }} 分
            </p>
          </div>
        </div>
        <div v-else class="tips">
          请登录EHR获取到用户信息后即可查询 !<br />
          <el-button type="primary" size="mini" @click="goLogin"
            >去登陆</el-button
          >
        </div>
      </el-tab-pane>
      <el-tab-pane
        label="小助手"
        name="second"
        class="funds"
        v-loading="iframeLoading"
      >
        <iframe
          v-if="tab_name === 'second' || cached"
          src="http://101.43.98.75:8088/#/"
          frameborder="0"
          @load="load"
        ></iframe>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import axios from "axios";
import countTo from "vue-count-to";

const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
let work_date = `${year}-${month}`;
export default {
  components: {
    countTo,
  },
  data() {
    return {
      staff_cookie: "",
      staff_id: "",
      staff_count: 0,
      staff_count_before: 0,
      work_date: work_date,
      loading: false,
      work_list: [],
      overtime_hours: 20, // 需要加班的小时数
      tab_name: "first",
      staff_expired: false, // 用户登录状态是否过期
      cached: false, // 缓存iframe页面
      iframeLoading: false,
    };
  },
  watch: {
    tab_name(val) {
      if (val === "second") {
        if (!this.cached) {
          this.iframeLoading = true;
        }
        this.cached = true;
      }
    },
  },
  computed: {
    staff_count_before_transtohour() {
      const hour = this.staff_count_before / 60;
      return hour.toFixed(2);
    },
    staff_count_transtohour() {
      const hour = this.staff_count / 60;
      return hour.toFixed(2);
    },
    tip_content() {
      const small_hours = 6;
      const hours_to_achieve =
        this.overtime_hours - this.staff_count_transtohour;
      const minutes_to_achieve = this.overtime_hours * 60 - this.staff_count;
      return `加油，离${this.overtime_hours}个小时加班时长${
        hours_to_achieve > small_hours ? "还" : "只"
      }差${hours_to_achieve.toFixed(2)}小时 / ${minutes_to_achieve}分钟`;
    },
  },
  created() {
    chrome.storage.sync.get(["staff_cookie"], (result) => {
      this.staff_cookie = result.staff_cookie;
    });
    chrome.storage.sync.get(["staff_id"], (result) => {
      this.staff_id = result.staff_id;
    });
    chrome.storage.sync.get(["staff_expired"], (result) => {
      this.staff_expired = result.staff_expired;
    });
  },
  methods: {
    load() {
      setTimeout(() => {
        this.iframeLoading = false;
      }, 100);
    },
    goLogin() {
      window.open(
        "https://portal.supcon.com/cas-web/login?service=https%3A%2F%2Fehr.supcon.com%2FRedseaPlatform%2F"
      );
    },
    startCalc() {
      if (!this.work_date) {
        this.$message.error("请选择要查询的加班月份");
        return;
      }
      this.loading = true;
      this.staff_count_before = 0;
      this.staff_count = 0;
      this.work_list = [];
      this.getTime();
    },
    getTime(day = 1, all = 0) {
      const year = new Date(this.work_date).getFullYear();
      const month = new Date(this.work_date).getMonth() + 1;
      const work_day = `${year}-${month}-${day}`;
      axios
        .get(
          `https://ehr.supcon.com/RedseaPlatform/getList/kq_count_SelectStaffIDDaily/CoreRequest.mc?staff_id=${this.staff_id}&work_day=${work_day}`
        )
        .then((data) => {
          // 返回信息中判断是否过期需要重新登录
          if (
            data.request.responseURL.indexOf("login") !== -1 ||
            this.staff_id.includes("document.")
          ) {
            this.staff_expired = true;
            chrome.storage.sync.set({ staff_expired: true });
            return;
          }
          const abnormal_type = "12";
          const abnormal_minute = data.data.jsonList[0].abnormal_minute || 0;
          let real_abnormal_minute = 0;
          if ((data.data.jsonList[0].abnormal_type || 0) === abnormal_type) {
            real_abnormal_minute = abnormal_minute;
          }
          this.work_list.push({
            date: `${year}-${month}-${day}`,
            time: real_abnormal_minute,
          });
          this.staff_count_before = all;
          this.staff_count = all + real_abnormal_minute;
          this.getTime(day + 1, all + real_abnormal_minute);
        })
        .catch((e) => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  width: 325px;
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
  font-size: 12px;

  &.funds {
    width: 500px;
    height: 500px;

    .el-tabs {
      /deep/ .el-tabs__content {
        height: calc(100vh - 41px);
      }
    }
  }

  .el-tabs {
    /deep/ .el-tabs__content {
      padding: 0;
      height: 300px;
      overflow-y: auto;
    }

    .funds {
      width: 100%;
      height: 100%;
      display: flex;

      iframe {
        width: 100%;
        height: 100%;

        html {
          overflow: hidden;
        }
      }
    }
  }

  .query_wrap {
    padding: 0 7px 10px;

    .query_head {
      background: #fff;
      position: sticky;
      top: 0;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
    }

    .query_detail {
      padding: 6px;

      .query_total {
        position: sticky;
        top: 62px;

        &:after {
          position: absolute;
          content: "";
          background: #fff;
          left: 0;
          right: 0;
          bottom: -6px;
          top: -12px;
          z-index: -1;
        }
      }

      p {
        margin: 6px 0;
        font-size: 14px;
        color: #333;
      }
    }
  }

  .tips {
    margin-top: 116px;
    text-align: center;
    font-style: italic;
    font-weight: bold;
    user-select: none;

    .el-button {
      margin-top: 10px;
    }
  }
}
</style>
