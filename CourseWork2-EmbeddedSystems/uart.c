#include "stdint.h"
#include "uart.h"
#include "MK70F12.h"
#include "filter1.h"
#include "filter2.h"
#include "filter3.h"
#include "filter4.h"

//filter variables
filter1Type* filter1;
filter2Type* filter2;
filter3Type* filter3;
filter4Type* filter4;

float float_rec_data, float_rec_data2, float_rec_data3, float_rec_data4;
int data_read;
unsigned char receive_data, receive_data2, receive_data3, receive_data4;
signed char data, data2, data3, data4, char_output, char_output2, char_output3, char_output4;
int curr_filter;
int sbr;
int brfa;
int count;

void uart_init(int LED) {
    
    //enable floating point unit
    SCB_CPACR = SCB_CPACR_CP10(3) | SCB_CPACR_CP11(3);
    
    // Enable clock gating to the correct pin port
    SIM_SCGC5 |= SIM_SCGC5_PORTE_MASK;
    SIM_SCGC4 |= SIM_SCGC4_UART2_MASK;
    
    
    curr_filter = LED;
    
    /*
     * enable UART device
     */
    PORTE_PCR17 = PORT_PCR_MUX(3);
    PORTE_PCR16 = PORT_PCR_MUX(3);
    UART2_C2 = 0;
    //set up parity and format bits
    UART2_C1 = 0;
    
    UART2_PFIFO = UART_PFIFO_TXFIFOSIZE_MASK | (UART_PFIFO_TXFIFOSIZE(1)) | UART_PFIFO_RXFIFOSIZE_MASK | (UART_PFIFO_RXFIFOSIZE(1));

    /*
     * select correct baud rate (115200)
     */
    UART2_BDH = UART_BDH_SBR(0);
    //set SBR
    UART2_BDL = UART_BDL_SBR(27);
    //set BRFA to 4
    UART2_C4 |= UART_C4_BRFA(4);
    
    //Tx and Rx on
    //RX is input, TX is output
    UART2_C2 = (1 << 2) | (1 << 3);
    
}

void uart_write(uint8_t transmit_buffer_data){
    if (UART2_SFIFO & UART_SFIFO_TXEMPT_MASK) {
        //transmit buffer empty, write stuff to it
        UART2_D = transmit_buffer_data;
    }
}

unsigned char uart_read() {
    unsigned char receive_buffer_data;
    data_read = 0;
    if (!(UART2_SFIFO & UART_SFIFO_RXEMPT_MASK)){
        //receive buffer has stuff in it, read it
        receive_buffer_data = UART2_D;
        data_read = 1;
        return receive_buffer_data;
    }
}

void applyFilter1(){
    //read
    filter1 = filter1_create();
    filter1_init(filter1);
    while (1){
        receive_data = uart_read();
        if(data_read){
            
            //convert from unsigned char -> signed char -> float
            data = (signed char)receive_data;
            float_rec_data = (((float)data) / 128.0);
            
            //filter input
            filter1_writeInput(filter1, float_rec_data);
            
            //convert back to signed char
            char_output = (signed char)(filter1_readOutput(filter1) * 128);
            
            //write unsigned char to UART
            uart_write((unsigned char)(char_output));
        }
    }
    return;
}

void applyFilter2(){
    //read
    filter2 = filter2_create();
    filter2_init(filter2);
    while (1){
        receive_data2 = uart_read();
        if(data_read){
            
            //convert from unsigned char -> signed char -> float
            data2 = (signed char)receive_data2;
            float_rec_data2 = (((float)data2) / 128.0);
            
            //filter input
            filter2_writeInput(filter2, float_rec_data2);
            
            //convert back to signed char
            char_output2 = (signed char)(filter2_readOutput(filter2) * 128);
            
            //write unsigned char to UART
            uart_write((unsigned char)(char_output2));
        }
    }
    return;
}

void applyFilter3(){
    //read
    filter3 = filter3_create();
    filter3_init(filter3);
    while (1){
        receive_data3 = uart_read();
        if(data_read){
            
            //convert from unsigned char -> signed char -> float
            data3 = (signed char)receive_data3;
            float_rec_data3 = (((float)data3) / 128.0);
            
            //filter input
            filter3_writeInput(filter3, float_rec_data3);
            
            //convert back to signed char
            char_output3 = (signed char)(filter3_readOutput(filter3) * 128);
            
            //write unsigned char to UART
            uart_write((unsigned char)(char_output3));
        }
    }
    return;
}

void applyFilter4(){
    //read
    filter4 = filter4_create();
    filter4_init(filter4);
    while (1){
        receive_data4 = uart_read();
        if(data_read){
            
            //convert from unsigned char -> signed char -> float
            data4 = (signed char)receive_data4;
            float_rec_data4 = (((float)data4) / 128.0);
            
            //filter input
            filter4_writeInput(filter4, float_rec_data4);
            
            //convert back to signed char
            char_output4 = (signed char)(filter4_readOutput(filter4) * 128);
            
            //write unsigned char to UART
            uart_write((unsigned char)(char_output4));
        }
    }
    return;
}
