#ifndef BUTTON_H__
#define BUTTON_H__

#define UP 0
#define DOWN 1

#define BIT_UP 1
#define BIT_DOWN (1 << 26)

extern void button_init();
extern void button_press(int button_id);
extern int getFilter();

#endif
