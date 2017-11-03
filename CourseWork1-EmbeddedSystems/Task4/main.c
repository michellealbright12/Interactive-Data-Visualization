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
  {LED_1_ALARM, LED_1_alarm, 2000,  9,   "led1alarm", 0},
  {LED_2_ALARM, LED_2_alarm, 2000,  9,   "led2alarm", 0},
  {LED_3_ALARM, LED_3_alarm, 2000,  9,   "led3alarm", 0},
  {LED_4_ALARM, LED_4_alarm, 2000,  9,   "led4alarm", 0},
  {0}
};

  /*TASK*-----------------------------------------------------------------
  * *
  * * Function Name  : Main_task
  * * Comments       :
  * *    This task initializes MFS and starts SHELL.
  * *
  * *END------------------------------------------------------------------*/

/*** variables for alarm ***/
HMI_CLIENT_STRUCT_PTR hmi_client;
int alarm1_flag, alarm2_flag, alarm3_flag, alarm4_flag;
int alarm1_enabled, alarm2_enabled, alarm3_enabled, alarm4_enabled;
unsigned counter, counter2, counter3, counter4;

/*** web ***/
unsigned char http_refresh_text[] = "\
  <html>\
    <body>\
      \
    </body>\
  </html>";

void Main_task(uint_32 initial_data) {
  counter = counter2 = counter3 = counter4 = 0;

   // initialize led task ids
  _task_id led1_task_id;
  _task_id led2_task_id;
  _task_id led3_task_id;
  _task_id led4_task_id;

  // create a task for each LED so they can run concurrently
  led1_task_id = _task_create(0, LED_1_ALARM, 0);
  led2_task_id = _task_create(0, LED_2_ALARM, 0);
  led3_task_id = _task_create(0, LED_3_ALARM, 0);
  led4_task_id = _task_create(0, LED_4_ALARM, 0);

  hmi_client  = _bsp_btnled_init();

  alarm1_flag = 0;
  alarm2_flag = 0;
  alarm3_flag = 0;
  alarm4_flag = 0;
  alarm1_enabled = 1;
  alarm2_enabled = 1;
  alarm3_enabled = 1;
  alarm4_enabled = 1;

  // initialize "alarms" to be on/enabled
  btnled_set_value(hmi_client, HMI_LED_1, HMI_VALUE_ON);
  btnled_set_value(hmi_client, HMI_LED_2, HMI_VALUE_ON);
  btnled_set_value(hmi_client, HMI_LED_3, HMI_VALUE_ON);
  btnled_set_value(hmi_client, HMI_LED_4, HMI_VALUE_ON);

  // leds will be touch sensitive, and flash when pushed
  btnled_add_clb(hmi_client, HMI_BUTTON_1, HMI_VALUE_PUSH, button_push1, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_2, HMI_VALUE_PUSH, button_push2, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_3, HMI_VALUE_PUSH, button_push3, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_4, HMI_VALUE_PUSH, button_push4, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_5, HMI_VALUE_PUSH, alarm_hush, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_6, HMI_VALUE_PUSH, all_alarms_switch, NULL);

  while(1) {
    //continually poll, and then yield to allow other tasks to run
    btnled_poll(hmi_client);
    _sched_yield();
  }
}


void LED_1_alarm(uint_32 initial_data) {

  // continually check to see if the alarm has been triggered
  for (;;) {
    // when the alarm is enabled
    if (alarm1_enabled) {

      // if the alarm has been trigged, blink the LED
      if (alarm1_flag == 1) {
        

        // alternate between LED-on and -off
        if (counter == 1) {
          btnled_set_value(hmi_client, HMI_LED_1, HMI_VALUE_ON);
          counter = 0;
        } else {
          btnled_set_value(hmi_client, HMI_LED_1, HMI_VALUE_OFF);
          counter = 1;
        }

        _time_delay(500);

      // if the alarm is not triggered, keep the LED on
      } else {
        btnled_set_value(hmi_client, HMI_LED_1, HMI_VALUE_ON);
      }

    } else { // if alarm is disabled
      btnled_set_value(hmi_client, HMI_LED_1, HMI_VALUE_OFF);
    }
    _sched_yield();
  }
}

void LED_2_alarm(uint_32 initial_data) {
  // continually check to see if the alarm has been triggered
  for (;;) {
    // when the alarm is enabled
    if (alarm2_enabled) {

      // if the alarm has been trigged, blink the LED
      if (alarm2_flag == 1) {
        // alternate between LED-on and -off
        if (counter2 == 1) {
          btnled_set_value(hmi_client, HMI_LED_2, HMI_VALUE_ON);
          counter2 == 0;
        } else {
          btnled_set_value(hmi_client, HMI_LED_2, HMI_VALUE_OFF);
          counter2 == 1;
        }

        _time_delay(500);

      // if the alarm is not triggered, keep the LED on
      } else {
        btnled_set_value(hmi_client, HMI_LED_2, HMI_VALUE_ON);
      }

    } else { // if alarm is disabled
      btnled_set_value(hmi_client, HMI_LED_2, HMI_VALUE_OFF);
    }

    _sched_yield();
  }
}

void LED_3_alarm(uint_32 initial_data) {
  // continually check to see if the alarm has been triggered
  for (;;) {
    // when the alarm is enabled
    if (alarm3_enabled) {

      // if the alarm has been trigged, blink the LED
      if (alarm3_flag == 1) {
        // alternate between LED-on and -off
        if (counter3 == 1) {
          btnled_set_value(hmi_client, HMI_LED_3, HMI_VALUE_ON);
          counter3 = 0;
        } else {
          btnled_set_value(hmi_client, HMI_LED_3, HMI_VALUE_OFF);
          counter3 = 1;
        }

        _time_delay(500);

      // if the alarm is not triggered, keep the LED on
      } else {
        btnled_set_value(hmi_client, HMI_LED_3, HMI_VALUE_ON);
      }

    } else { // if alarm is disabled
      btnled_set_value(hmi_client, HMI_LED_3, HMI_VALUE_OFF);
    }

    _sched_yield();
  }
}

void LED_4_alarm(uint_32 initial_data) {
  // continually check to see if the alarm has been triggered
  for (;;) {
    // when the alarm is enabled
    if (alarm4_enabled) {

      // if the alarm has been trigged, blink the LED
      if (alarm4_flag == 1) {
        // alternate between LED-on and -off
        if (counter4 == 1) {
          btnled_set_value(hmi_client, HMI_LED_4, HMI_VALUE_ON);
          counter4 = 0;
        } else {
          btnled_set_value(hmi_client, HMI_LED_4, HMI_VALUE_OFF);
          counter4 = 1;
        }

        _time_delay(500);

      // if the alarm is not triggered, keep the LED on
      } else {
        btnled_set_value(hmi_client, HMI_LED_4, HMI_VALUE_ON);
      }

    } else { // if alarm is disabled
      btnled_set_value(hmi_client, HMI_LED_4, HMI_VALUE_OFF);
    }

    _sched_yield();
  }
}

void button_push1(void *ptr)
{
  alarm1_flag = 1;
}

void button_push2(void *ptr)
{
  alarm2_flag = 1;
}

void button_push3(void *ptr)
{
  alarm3_flag = 1;
}

void button_push4(void *ptr)
{
  alarm4_flag = 1;
}

void alarm_hush(void *ptr)
{
  alarm1_flag = 0;
  alarm2_flag = 0;
  alarm3_flag = 0;
  alarm4_flag = 0;
}

//enables or disables alarms depending on their current state
void all_alarm_switch(void *ptr)
{
  alarm1_enabled = 1 - alarm1_enabled;
  alarm2_enabled = alarm3_enabled = alarm4_enabled = alarm1_enabled;
}
 /* EOF */
