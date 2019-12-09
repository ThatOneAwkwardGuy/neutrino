import Schema from 'validate';

export const ValidateSchema = (schema, object) => {
  const errors = schema.validate(object);
  if (errors.length > 0) {
    throw new Error(`${errors.join(';')}`);
  }
};

export const FootpatrolSchema = new Schema({
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  },
  deliveryAddress: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Address must be a string.',
      required: 'Delivery Address is required.'
    },
    length: { min: 1 }
  },
  deliveryZip: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Zip must be a string.',
      required: 'Delivery Zip is required.'
    },
    length: { min: 1 }
  }
  //   phone: { type: String, required: true, length: { min: 1 } }
});

export const FootpatrolUKSchema = new Schema({
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  },
  deliveryAddress: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Address must be a string.',
      required: 'Delivery Address is required.'
    },
    length: { min: 1 }
  },
  deliveryZip: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Zip must be a string.',
      required: 'Delivery Zip is required.'
    },
    length: { min: 1 }
  }
  //   phone: { type: String, required: true, length: { min: 1 } }
});

export const NakedCPHSchema = new Schema({
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  },
  deliveryZip: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Zip must be a string.',
      required: 'Delivery Zip is required.'
    },
    length: { min: 1 }
  },
  deliveryCountry: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Country must be a string.',
      required: 'Delivery Country is required.'
    },
    length: { min: 1 }
  }
});

export const ExtraButterSchema = new Schema({
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  },
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  deliveryAddress: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Address must be a string.',
      required: 'Delivery Address is required.'
    },
    length: { min: 1 }
  },
  deliveryCity: {
    type: String,
    required: true,
    message: {
      type: 'Delivery City must be a string.',
      required: 'Delivery City is required.'
    },
    length: { min: 1 }
  },
  deliveryZip: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Zip must be a string.',
      required: 'Delivery Zip is required.'
    },
    length: { min: 1 }
  },
  deliveryRegion: {
    type: String,
    required: false,
    message: {
      type: 'Delivery Region must be a string.',
      required: 'Delivery Region is required.'
    }
  },
  //   phone: { type: String, required: true, length: { min: 1 } },
  deliveryCountry: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Country must be a string.',
      required: 'Delivery Country is required.'
    },
    length: { min: 1 }
  },
  card: {
    cardNumber: {
      type: String,
      required: true,
      message: {
        type: 'Card Number must be a string.',
        required: 'Card Number is required.'
      },
      length: { min: 1 }
    },
    cvv: {
      type: String,
      required: true,
      message: {
        type: 'Card CVV must be a string.',
        required: 'Card CVV is required.'
      },
      length: { min: 1 }
    },
    expMonth: {
      type: String,
      required: true,
      message: {
        type: 'Card Expiry Month must be a string.',
        required: 'Card Expiry Month is required.'
      },
      length: { min: 1 }
    },
    expYear: {
      type: String,
      required: true,
      message: {
        type: 'Card Expiry Year must be a string.',
        required: 'Card Expiry Year is required.'
      },
      length: { min: 1 }
    }
  }
});

export const BodegaSchema = new Schema({
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  }
});

export const CityBlueSchema = new Schema({
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  },
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  instagram: {
    type: String,
    required: true,
    message: {
      type: 'Instagram must be a string.',
      required: 'Instagram is required.'
    },
    length: { min: 1 }
  }
});

export const LapstoneAndHammerSchema = new Schema({
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  },
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  instagram: {
    type: String,
    required: true,
    message: {
      type: 'Instagram must be a string.',
      required: 'Instagram is required.'
    },
    length: { min: 1 }
  }
});

export const RenartsSchema = new Schema({
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  },
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  deliveryAddress: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Address must be a string.',
      required: 'Delivery Address is required.'
    },
    length: { min: 1 }
  },
  deliveryCity: {
    type: String,
    required: true,
    message: {
      type: 'Delivery City must be a string.',
      required: 'Delivery City is required.'
    },
    length: { min: 1 }
  },
  deliveryZip: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Zip must be a string.',
      required: 'Delivery Zip is required.'
    },
    length: { min: 1 }
  },
  deliveryRegion: {
    type: String,
    required: false,
    message: {
      type: 'Delivery Region must be a string.',
      required: 'Delivery Region is required.'
    }
  },
  //   phone: { type: String, required: true, length: { min: 1 } },
  deliveryCountry: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Country must be a string.',
      required: 'Delivery Country is required.'
    },
    length: { min: 1 }
  },
  card: {
    cardNumber: {
      type: String,
      required: true,
      message: {
        type: 'Card Number must be a string.',
        required: 'Card Number is required.'
      },
      length: { min: 1 }
    },
    cvv: {
      type: String,
      required: true,
      message: {
        type: 'Card CVV must be a string.',
        required: 'Card CVV is required.'
      },
      length: { min: 1 }
    },
    expMonth: {
      type: String,
      required: true,
      message: {
        type: 'Card Expiry Month must be a string.',
        required: 'Card Expiry Month is required.'
      },
      length: { min: 1 }
    },
    expYear: {
      type: String,
      required: true,
      message: {
        type: 'Card Expiry Year must be a string.',
        required: 'Card Expiry Year is required.'
      },
      length: { min: 1 }
    }
  }
});

export const DSMSchema = new Schema({
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  phone: {
    type: String,
    required: true,
    message: {
      type: 'Phone Number must be a string.',
      required: 'Phone Number is required.'
    },
    length: { min: 1 }
  },
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  },
  deliveryZip: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Zip must be a string.',
      required: 'Delivery Zip is required.'
    },
    length: { min: 1 }
  }
});

export const DSMNYSchema = new Schema({
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  phone: {
    type: String,
    required: true,
    message: {
      type: 'Phone Number must be a string.',
      required: 'Phone Number is required.'
    },
    length: { min: 1 }
  },
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  },
  deliveryZip: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Zip must be a string.',
      required: 'Delivery Zip is required.'
    },
    length: { min: 1 }
  }
});

export const Stress95Schema = new Schema({
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  },
  deliveryCountry: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Country must be a string.',
      required: 'Delivery Country is required.'
    },
    length: { min: 1 }
  }
});

export const FearOfGodSchema = new Schema({
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  }
});

export const FootDistrictSchema = new Schema({
  deliveryFirstName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery First Name must be a string.',
      required: 'Delivery First Name is required.'
    },
    length: { min: 1 }
  },
  deliveryLastName: {
    type: String,
    required: true,
    message: {
      type: 'Delivery Last Name must be a string.',
      required: 'Delivery Last Name is required.'
    },
    length: { min: 1 }
  },
  email: {
    type: String,
    required: true,
    message: {
      type: 'Email must be a string.',
      required: 'Email is required.'
    },
    length: { min: 1 }
  }
});

export const ENDSchema = new Schema({});
