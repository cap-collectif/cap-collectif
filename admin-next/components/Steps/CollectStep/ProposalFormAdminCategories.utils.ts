import { CapUIIcon } from '@cap-collectif/ui';

enum IconNameTable {
    AGRICULTURE_MACHINE_TRACTOR = 'Agriculture',
    BASKETBALL_BALL = 'Basket',
    BICYCLE = 'Bike',
    BIN = 'Trashbin',
    BOAT = 'Boat',
    BOOK_FLIP_PAGE = 'Book',
    BRIEFCASE = 'Professional',
    BUS_STATION = 'Bus',
    CAR = 'Car',
    CARPOOLING = 'Carpooling',
    COCKTAIL = 'Cocktail',
    COMPANY = 'Company',
    CONSTRUCTION_CONE = 'Construct',
    CULTURE = 'Culture',
    DOG_LEASH = 'Dog',
    EARTH = 'Earth',
    ECOLOGY_LEAF = 'Ecology',
    ECONOMY = 'Graph',
    ELDERLY = 'Older',
    ENERGY = 'Battery',
    FAMILY_CHILDREN = 'Family',
    FAMILY_CHILD_PLAY_BALL = 'Sport',
    FAMILY_WALK_PARK = 'OutsidePlay',
    FARMER_MARKET = 'Shop',
    GAS_STATION = 'Gas',
    GRADUATE = 'Education',
    GROCERY_SHOPPING = 'Cart',
    HAND = 'Donate',
    HEALTH = 'Quartiac',
    HIERARCHY = 'Network',
    HOSPITAL = 'Hospital',
    ICN = 'Electricity',
    LIGHT_BULB = 'Bulb',
    MEDICAL = 'Health',
    MOBILE_PHONE = 'Smartphone',
    NETWORK = 'Network',
    OFFICER = 'Police',
    OFFICIAL_BUILDING = 'Building',
    PARAPLEGIC = 'Disability',
    PARKING = 'Parking',
    PARK_BENCH_LIGHT = 'Bench',
    PASSPORT = 'Profil',
    RAILROAD_TRAIN = 'Train',
    RECYCLE = 'Recycle',
    RESTAURANT = 'Restaurant',
    SHOPPING_BAG = 'Bag',
    SOLIDARITY = 'Solidarity',
    SURVEILLANCE_CAMERA = 'Camera',
    TRAVEL = 'Travel',
    TREE = 'Tree',
    URBANISM = 'Assembly',
    VEGETABLES_PLATE = 'Food',
    VILLAGE = 'Village',
    WATER = 'Waterdrop',
}

const convertIconToDs = (icon: string): CapUIIcon => {
    const iconName = icon.toUpperCase().replace(/-/g, '_');
    // @ts-ignore
    return IconNameTable[iconName as IconNameTable] as CapUIIcon;
};
export default convertIconToDs;

// Electricity
// Web
