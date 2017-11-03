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

/* function declarations */
void button_push1(void *ptr);
void button_push2(void *ptr);
void button_push3(void *ptr);
void button_push4(void *ptr);

void button_release1(void *ptr);
void button_release2(void *ptr);
void button_release3(void *ptr);
void button_release4(void *ptr);

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

//initialize hmi_client variable
HMI_CLIENT_STRUCT_PTR hmi_client;

void Main_task(uint_32 initial_data)
{
  //initialize library for controlling touch buttons and LEDs
  hmi_client  = _bsp_btnled_init();

  /*
   *code below changes intial values of LEDs from all on to all off
   */
  btnled_set_value(hmi_client, HMI_LED_1, HMI_VALUE_OFF);
  btnled_set_value(hmi_client, HMI_LED_2, HMI_VALUE_OFF);
  btnled_set_value(hmi_client, HMI_LED_3, HMI_VALUE_OFF);
  btnled_set_value(hmi_client, HMI_LED_4, HMI_VALUE_OFF);

  /*
   * code below makes individual LEDs push sensitive by adding each push/release callback
   */

  btnled_add_clb(hmi_client, HMI_BUTTON_1, HMI_VALUE_PUSH, button_push1, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_1, HMI_VALUE_RELEASE, button_release1, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_2, HMI_VALUE_PUSH, button_push2, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_2, HMI_VALUE_RELEASE, button_release2, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_3, HMI_VALUE_PUSH, button_push3, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_3, HMI_VALUE_RELEASE, button_release3, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_4, HMI_VALUE_PUSH, button_push4, NULL);
  btnled_add_clb(hmi_client, HMI_BUTTON_4, HMI_VALUE_RELEASE, button_release4, NULL);

  //polls the tower board in order to detect changes on the push sensors
  while(1) btnled_poll(hmi_client);
}

//the following functions turn each individual LED light ON/OFF depending on if
//the LED is pushed or released
void button_push1(void *ptr)
{
  btnled_set_value(hmi_client, HMI_LED_1, HMI_VALUE_ON);
}

void button_release1(void *ptr)
{
  btnled_set_value(hmi_client, HMI_LED_1, HMI_VALUE_OFF);
}

void button_push2(void *ptr)
{
  btnled_set_value(hmi_client, HMI_LED_2, HMI_VALUE_ON);
}

void button_release2(void *ptr)
{
  btnled_set_value(hmi_client, HMI_LED_2, HMI_VALUE_OFF);
}

void button_push3(void *ptr)
{
  btnled_set_value(hmi_client, HMI_LED_3, HMI_VALUE_ON);
}

void button_release3(void *ptr)
{
  btnled_set_value(hmi_client, HMI_LED_3, HMI_VALUE_OFF);
}

void button_push4(void *ptr)
{
  btnled_set_value(hmi_client, HMI_LED_4, HMI_VALUE_ON);
}

void button_release4(void *ptr)
{
  btnled_set_value(hmi_client, HMI_LED_4, HMI_VALUE_OFF);
}


/* EOF */
