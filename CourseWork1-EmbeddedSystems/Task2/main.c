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

//static data to appear on web page
unsigned char http_refresh_text[] = "Hello World!";
const TFS_DIR_ENTRY static_data[] = {{"/index.html", 0, http_refresh_text, sizeof(http_refresh_text)}, {0,0,0,0}};

//create root directory to point to file system initialized in Main_task
static HTTPD_ROOT_DIR_STRUCT http_root_dir[] = { {"", "tfs:"}, { 0,0 } };

//declare http_server atruct
HTTPD_STRUCT* http_server;
void Main_task(uint_32 initial_data)
{
  //initialize RTCS library to run web server
  rtcs_init();

  //install file system
  _io_tfs_install("tfs:", static_data);

  //initialize http server with root directory and index file, then run it
  http_server = httpd_server_init_af(http_root_dir, "\\index.html", AF_INET);
  httpd_server_run(http_server);
  while(1) ipcfg_task_poll();

}

/* EOF */
