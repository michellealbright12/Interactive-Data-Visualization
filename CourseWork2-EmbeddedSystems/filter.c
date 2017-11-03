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

#include "filter.h"

#include <stdlib.h> // For malloc/free
#include <string.h> // For memset

float filter_coefficients[4][20] =
{
// Scaled for floating point
  {
    0.9559025796657589, -1.9118051593315177, 0.9559025796657589, 1.527635591369355, -0.7253280429895612,// b0, b1, b2, a1, a2
    0.25, -0.5, 0.25, 1.7479956457420662, -0.8993446739158173,// b0, b1, b2, a1, a2
    0.0625, 0.125, 0.0625, 1.325173051363978, -0.6584500002289182,// b0, b1, b2, a1, a2
    0.0625, 0.125, 0.0625, 1.3138787406673829, -0.8278481652242764// b0, b1, b2, a1, a2
  },

  {
    0.14903818094588128, -0.29807636189176256, 0.14903818094588128, 0.6009532423247502, -0.835172813291451,// b0, b1, b2, a1, a2
    0.0625, -0.125, 0.0625, 0.7257577382283413, -0.9298543567377061,// b0, b1, b2, a1, a2
    0.125, 0.25, 0.125, 0.4672156621466492, -0.8316490295746326,// b0, b1, b2, a1, a2
    0.0625, 0.125, 0.0625, 0.39004046713368923, -0.9260132764830762// b0, b1, b2, a1, a2
  },
  {
    0.23897564491644038, -0.47795128983288077, 0.23897564491644038, -0.20582187469403773, -0.6869973849561894,// b0, b1, b2, a1, a2
    0.125, -0.25, 0.125, -0.027172519467246737, -0.8581727302742403,// b0, b1, b2, a1, a2
    0.25, 0.5, 0.25, -0.46354156147532416, -0.695187871934875,// b0, b1, b2, a1, a2
    0.125, 0.25, 0.125, -0.6912446676183592, -0.8675652487437044// b0, b1, b2, a1, a2
  },
  {
    0.1238245861926606, -0.2476491723853212, 0.1238245861926606, -1.2220875221654894, -0.46223724401245486,// b0, b1, b2, a1, a2
    0.0625, -0.125, 0.0625, -1.237981840349054, -0.7151285708936009,// b0, b1, b2, a1, a2
    1, 2, 1, -1.6338725584832217, -0.6958169496025528,// b0, b1, b2, a1, a2
    0.5, 1, 0.5, -1.8690948366571372, -0.9080021415622019// b0, b1, b2, a1, a2
  }

};


filterType *filter_create( void )
{
	filterType *result = (filterType *)malloc( sizeof( filterType ) );	// Allocate memory for the object
	filter_init( result );											// Initialize it
	return result;																// Return the result
}

void filter_destroy( filterType *pObject )
{
	free( pObject );
}

 void filter_init( filterType * pThis )
{
	filter_reset( pThis );

}

 void filter_reset( filterType * pThis )
{
	memset( &pThis->state, 0, sizeof( pThis->state ) ); // Reset state to 0
	pThis->output = 0;									// Reset output

}

 int filter_filterBlock( filterType * pThis, float * pInput, float * pOutput, unsigned int count, unsigned char filter_number )
{
	filter_executionState executionState;          // The executionState structure holds call data, minimizing stack reads and writes
	if( ! count ) return 0;                         // If there are no input samples, return immediately
	executionState.pInput = pInput;                 // Pointers to the input and output buffers that each call to filterBiquad() will use
	executionState.pOutput = pOutput;               // - pInput and pOutput can be equal, allowing reuse of the same memory.
	executionState.count = count;                   // The number of samples to be processed
	executionState.pState = pThis->state;                   // Pointer to the biquad's internal state and coefficients.
	executionState.pCoefficients = *(filter_coefficients+filter_number);    // Each call to filterBiquad() will advance pState and pCoefficients to the next biquad

	// The 1st call to filter_filterBiquad() reads from the caller supplied input buffer and writes to the output buffer.
	// The remaining calls to filterBiquad() recycle the same output buffer, so that multiple intermediate buffers are not required.

	filter_filterBiquad( &executionState );		// Run biquad #0
	executionState.pInput = executionState.pOutput;         // The remaining biquads will now re-use the same output buffer.

	filter_filterBiquad( &executionState );		// Run biquad #1

	filter_filterBiquad( &executionState );		// Run biquad #2

	filter_filterBiquad( &executionState );		// Run biquad #3

	// At this point, the caller-supplied output buffer will contain the filtered samples and the input buffer will contain the unmodified input samples.
	return count;		// Return the number of samples processed, the same as the number of input samples

}

 void filter_filterBiquad( filter_executionState * pExecState )
{
	// Read state variables
	float w0, x0;
	float w1 = pExecState->pState[0];
	float w2 = pExecState->pState[1];

	// Read coefficients into work registers
	float b0 = *(pExecState->pCoefficients++);
	float b1 = *(pExecState->pCoefficients++);
	float b2 = *(pExecState->pCoefficients++);
	float a1 = *(pExecState->pCoefficients++);
	float a2 = *(pExecState->pCoefficients++);

	// Read source and target pointers
	float *pInput  = pExecState->pInput;
	float *pOutput = pExecState->pOutput;
	short count = pExecState->count;
	float accumulator;

	// Loop for all samples in the input buffer
	while( count-- )
	{
		// Read input sample
		x0 = *(pInput++);

		// Run feedback part of filter
		accumulator  = w2 * a2;
		accumulator += w1 * a1;
		accumulator += x0 ;

		w0 = accumulator ;

		// Run feedforward part of filter
		accumulator  = w0 * b0;
		accumulator += w1 * b1;
		accumulator += w2 * b2;

		w2 = w1;		// Shuffle history buffer
		w1 = w0;

		// Write output
		*(pOutput++) = accumulator ;
	}

	// Write state variables
	*(pExecState->pState++) = w1;
	*(pExecState->pState++) = w2;

}
