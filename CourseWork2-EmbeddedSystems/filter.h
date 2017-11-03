/******************************* SOURCE LICENSE *********************************
Copyright (c) 2015 MicroModeler.

A non-exclusive, nontransferable, perpetual, royalty-free license is granted to the Licensee to
use the following Information for academic, non-profit, or government-sponsored research purposes.
Use of the following Information under this License is restricted to NON-COMMERCIAL PURPOSES ONLY.
Commercial use of the following Information requires a separately executed written license agreement.

This Information is distributed WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

******************************* END OF LICENSE *********************************/

// A commercial license for MicroModeler DSP can be obtained at http://www.micromodeler.com/launch.jsp

// Begin header file, filter.h

#ifndef FILTER_H_ // Include guards
#define FILTER_H_

static const int filter_numStages = 4;
static const int filter_coefficientLength = 20;
extern float filter_coefficients[4][20];

typedef struct
{
	float state[16];
	float output;
} filterType;

typedef struct
{
	float *pInput;
	float *pOutput;
	float *pState;
	float *pCoefficients;
	short count;
} filter_executionState;


filterType *filter_create( void );
void filter_destroy( filterType *pObject );
 void filter_init( filterType * pThis );
 void filter_reset( filterType * pThis );
#define filter_writeInput( pThis, input, filter_number )  \
	filter_filterBlock( pThis, &input, &pThis->output, 1, filter_number );

#define filter_readOutput( pThis )  \
	pThis->output

 int filter_filterBlock( filterType * pThis, float * pInput, float * pOutput, unsigned int count, unsigned char filter_number );
#define filter_outputToFloat( output )  \
	(output)

#define filter_inputFromFloat( input )  \
	(input)

 void filter_filterBiquad( filter_executionState * pExecState );
#endif // FILTER_H_
