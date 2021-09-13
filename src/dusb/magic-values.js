// Javascript implementation of a subset of the DUSB / CARS protocol
// Values taken from tilibs (https://github.com/debrouxl/tilibs)

module.exports = {

  // Raw packet types
  // https://github.com/debrouxl/tilibs/blob/master/libticalcs/trunk/src/dusb_rpkt.h

  rawPacketTypes: {
    DUSB_RPKT_BUF_SIZE_REQ:    1,
    DUSB_RPKT_BUF_SIZE_ALLOC:  2,

    DUSB_RPKT_VIRT_DATA:       3,
    DUSB_RPKT_VIRT_DATA_LAST:  4,
    DUSB_RPKT_VIRT_DATA_ACK:   5,

    HEADER_SIZE:               4 + 1
  },

  // Virtual packet types
  // https://github.com/debrouxl/tilibs/blob/master/libticalcs/trunk/src/dusb_vpkt.h

  virtualPacketTypes: {
    DUSB_VPKT_PING:            0x0001,
    DUSB_VPKT_OS_BEGIN:        0x0002,
    DUSB_VPKT_OS_ACK:          0x0003,
    DUSB_VPKT_OS_HEADER:       0x0004,
    DUSB_VPKT_OS_DATA:         0x0005,
    DUSB_VPKT_EOT_ACK:         0x0006,
    DUSB_VPKT_PARM_REQ:        0x0007,
    DUSB_VPKT_PARM_DATA:       0x0008,
    DUSB_VPKT_DIR_REQ:         0x0009,
    DUSB_VPKT_VAR_HDR:         0x000A,
    DUSB_VPKT_RTS:             0x000B,
    DUSB_VPKT_VAR_REQ:         0x000C,
    DUSB_VPKT_VAR_CNTS:        0x000D,
    DUSB_VPKT_PARM_SET:        0x000E,
    DUSB_VPKT_MODIF_VAR:       0x0010,
    DUSB_VPKT_EXECUTE:         0x0011,
    DUSB_VPKT_MODE_SET:        0x0012,

    DUSB_VPKT_DATA_ACK:        0xAA00,
    DUSB_VPKT_DELAY_ACK:       0xBB00,
    DUSB_VPKT_EOT:             0xDD00,
    DUSB_VPKT_ERROR:           0xEE00,

    HEADER_SIZE:               4 + 2
  },

  // Modes
  // https://github.com/debrouxl/tilibs/blob/master/libticalcs/trunk/src/dusb_cmd.h

  modes: {
    DUSB_MODE_STARTUP:         [ 0,1, 0,1, 0,0, 0,0, 0x07,0xd0 ],
    DUSB_MODE_BASIC:           [ 0,2, 0,1, 0,0, 0,0, 0x07,0xd0 ],
    DUSB_MODE_NORMAL:          [ 0,3, 0,1, 0,0, 0,0, 0x07,0xd0 ]
  },

  // Execute commands
  // https://github.com/debrouxl/tilibs/blob/master/libticalcs/trunk/src/dusb_cmd.h

  executeCommands: {
    DUSB_EID_PRGM:              0x00,
    DUSB_EID_ASM:               0x01,
    DUSB_EID_APP:               0x02,
    DUSB_EID_KEY:               0x03,
    DUSB_EID_UNKNOWN:           0x04
  },

  // Parameter IDs
  // https://github.com/debrouxl/tilibs/blob/master/libticalcs/trunk/src/dusb_cmd.h

  parameters: {
    DUSB_PID_PRODUCT_NUMBER:    0x0001,
    DUSB_PID_PRODUCT_NAME:      0x0002,
    DUSB_PID_MAIN_PART_ID:      0x0003,
    DUSB_PID_HW_VERSION:        0x0004,
    DUSB_PID_FREE_RAM:          0x000E,
    DUSB_PID_FREE_FLASH:        0x0011,
    DUSB_PID_COLOR_AVAILABLE:   0x001B,
    DUSB_PID_BITS_PER_PIXEL:    0x001D,
    DUSB_PID_LCD_WIDTH:         0x001E,
    DUSB_PID_LCD_HEIGHT:        0x001F,
    DUSB_PID_MATH_CAPABILITIES: 0x004B,
    DUSB_PID_PYTHON_ON_BOARD:   0x005D
  },

  // Attributes IDs
  // https://github.com/debrouxl/tilibs/blob/master/libticalcs/trunk/src/dusb_cmd.h

  attributes: {
    DUSB_AID_VAR_SIZE:          0x01,
    DUSB_AID_VAR_TYPE:          0x02,
    DUSB_AID_ARCHIVED:          0x03,
    DUSB_AID_VAR_VERSION:       0x08,
  },

  // Transfer modes
  // Inferred from https://github.com/debrouxl/tilibs/blob/master/libticalcs/trunk/src/dusb_cmd.cc

  transferModes: {
    SILENT:                     0x01,
    NON_SILENT:                 0x02
  }

};
