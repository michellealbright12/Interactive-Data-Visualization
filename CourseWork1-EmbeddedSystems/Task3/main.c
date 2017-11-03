/**HEADER*******************************************************************
 * *
 * * Copyright (c) 2008 Freescale Semiconductor;
 * * All Rights Reserved
 * *
 * * Copyright (c) 1989-2008 ARC International;
 * * All Rights Reserved
 * *
 * ****************************************************************************
 * *
 * * THIS SOFTWARE IS PROVIDED BY FREESCALE "AS IS" AND ANY EXPRESSED OR
 * * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * * IN NO EVENT SHALL FREESCALE OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * * THE POSSIBILITY OF SUCH DAMAGE.
 * *
 * ****************************************************************************
 * *
 * * Comments:
 * *
 * *   This file contains main initialization for your application
 * *   and infinite loop
 * *
 * *END************************************************************************/

#include "main.h"
#include <tfs.h>
#include <httpd.h>
#include <httpd_types.h>


#if defined(APPLICATION_HAS_SHELL) && (!SHELLCFG_USES_RTCS)
#error This application requires SHELLCFG_USES_RTCS defined non-zero in user_config.h. Please recompile libraries with this option if any Ethernet interface is available.
#endif

TASK_TEMPLATE_STRUCT MQX_template_list[] =
{
/*  Task number, Entry point, Stack, Pri, String, Auto? */
   {MAIN_TASK,   Main_task,   2000,  9,   "main", MQX_AUTO_START_TASK},
   {0,           0,           0,     0,   0,      0,                 }
};

/*TASK*-----------------------------------------------------------------
 * *
 * * Function Name  : Main_task
 * * Comments       :
 * *    This task initializes MFS and starts SHELL.
 * *
 * *END------------------------------------------------------------------*/

HMI_CLIENT_STRUCT_PTR hmi_client;
// form data to display on web page when asking to submit time
unsigned char http_refresh_text[] = "\
  <html>\
    <form>Time in seconds:<br>\
      <input type='text' name='time' ><br>\
      <input type='submit' value='Submit'>\
    </form>\
  </html>";
const TFS_DIR_ENTRY static_data[] = {{"/index.html", 0, http_refresh_text, sizeof(http_refresh_text)}, {0,0,0,0}};
static HTTPD_ROOT_DIR_STRUCT http_root_dir[] = { {"", "tfs:"}, { 0,0 } };

// global variable declarations
HTTPD_STRUCT* http_server;
HTTPD_SESSION_STRUCT* session;
RTC_TIME_STRUCT curr_time;
int minutes, seconds, hours;
char getTimeBuffer[500];
char setTimePage[500];
RTC_TIME_STRUCT the_new_RTC_time;
int theNewTime;
char* theNewTimeChar;

/* Task 3 Part 1: toggle led when web page accessed */

_mqx_int led_callback(HTTPD_SESSION_STRUCT *session){
  // get led number from url
  int led = atoi(session->request.urldata);

  // text displayed when web page loaded
  httpd_sendstr(session->sock, "<html><body>LED toggled</body></html>");

  // toggle led on/off
  btnled_toogle(hmi_client, HMI_GET_LED_ID(led));
  return session->request.content_len;
}

/* Task 3 Part 3: allow the user to specify the time */
_mqx_int set_time_page(HTTPD_SESSION_STRUCT *session){
  // display form and submit button that allows user to input the time
  sprintf(setTimePage, "\
  <html>\
    <form action='displaytime.cgi' method='get'> Time in seconds: <br>\
      <input type='text' name='time'><br>\
      <button type='submit'>Submit</button>\
    </form>
  </html>");
  httpd_sendstr(session->sock, setTimePage);
  return session->request.content_len;
}

/* this function sets the rtc time (if specified by the user) and displays it,
* or just gets the rtc time if no time has been specified, and displays it. */
_mqx_int display_time(HTTPD_SESSION_STRUCT *session){
  // get user defined time
  theNewTimeChar = session->request.urldata;

  // if there is some urldata, then the user has specified a new time, so set the time
  if (strlen(theNewTimeChar) != 0){
    // get just the integer value from the URL variable
    theNewTime = atoi(&theNewTimeChar[5]);
    the_new_RTC_time.seconds = theNewTime;

    //set new rtc time to be user specified time
    curr_time = the_new_RTC_time;
    _rtc_set_time(&curr_time);
  } else {
    /* Task 3 Part 2: get value of RTC */

    // get time from the rtc if no user specified time
    _rtc_get_time(&curr_time);
  }
  // time conversion from seconds to Hrs:Mins:Secs
  minutes = curr_time.seconds/ 60;
  seconds = curr_time.seconds % 60;
  if (minutes >= 60){
    hours = minutes / 60;
    minutes = minutes % 60;
  }
  else{
    hours = 0;
  }
  // format time into a string and send it out in response to CGI request
  sprintf(getTimeBuffer, "<html><body>Time:%u:%u:%u</body></html>", hours, minutes, seconds);
  httpd_sendstr(session->sock, getTimeBuffer);
  return session->request.content_len;
}
// cgi function table with led toggle page, user set time page, and the display time page
static HTTPD_CGI_LINK_STRUCT http_cgi_params[] = { {"led", led_callback}, {"time", set_time_page}, {"displaytime", display_time}, {0,0}};

void Main_task(uint_32 initial_data)
{
  hmi_client  = _bsp_btnled_init();

  // initialize RTCS library
  rtcs_init();

  // set up RTC
  _rtc_init(RTC_INIT_FLAG_ENABLE);

  // install file system
  _io_tfs_install("tfs:", static_data);

  // initialize http server with root directory and index file, then run it
  http_server = httpd_server_init_af(http_root_dir, "\\index.html", AF_INET);
  HTTPD_SET_PARAM_CGI_TBL(http_server, http_cgi_params);
  httpd_server_run(http_server);

  while(1) ipcfg_task_poll();
}
/* EOF */
