<?php

namespace Capco\AppBundle\Enum;

final class AvailableProposalCategoryIcon implements EnumType
{
    public const GAS_STATION = 'gas-station';
    public const BOAT = 'boat';
    public const EARTH = 'earth';
    public const TRAVEL = 'travel';
    public const PASSPORT = 'passport';
    public const ECONOMY = 'economy';
    public const PARKING = 'parking';
    public const COCKTAIL = 'cocktail';
    public const RESTAURANT = 'restaurant';
    public const FARMER_MARKET = 'farmer-market';
    public const NETWORK = 'network';
    public const MOBILE_PHONE = 'mobile-phone';
    public const COMPANY = 'company';
    public const URBANISM = 'urbanism';
    public const VILLAGE = 'village';
    public const CONSTRUCTION_CONE = 'construction-cone';
    public const VEGETABLES_PLATE = 'vegetables-plate';
    public const GROCERY_SHOPPING = 'grocery-shopping';
    public const SHOPPING_BAG = 'shopping-bag';
    public const MEDICAL = 'medical';
    public const HOSPITAL = 'hospital';
    public const HEALTH = 'health';
    public const BICYCLE = 'bicycle';
    public const OFFICER = 'officer';
    public const SURVEILLANCE_CAMERA = 'surveillance-camera';
    public const FAMILY_CHILDREN = 'family-children';
    public const FAMILY_WALK_PARK = 'family-walk-park';
    public const FAMILY_CHILD_PLAY_BALL = 'family-child-play-ball';
    public const BASKETBALL_BALL = 'basketball-ball';
    public const DOG_LEASH = 'dog-leash';
    public const WATER = 'water';
    public const TREE = 'tree';
    public const PARK_BENCH_LIGHT = 'park-bench-light';
    public const RECYCLE = 'recycle';
    public const BIN = 'bin';
    public const AGRICULTURE_MACHINE_TRACTOR = 'agriculture-machine-tractor';
    public const HAND = 'hand';
    public const SOLIDARITY = 'solidarity';
    public const HIERARCHY = 'hierarchy';
    public const ELDERLY = 'elderly';
    public const PARAPLEGIC = 'paraplegic';
    public const CAR = 'car';
    public const CARPOOLING = 'carpooling';
    public const BUS_STATION = 'bus-station';
    public const RAILROAD_TRAIN = 'railroad-train';
    public const BRIEFCASE = 'briefcase';
    public const BOOK_FLIP_PAGE = 'book-flip-page';
    public const CULTURE = 'culture';
    public const OFFICIAL_BUILDING = 'official-building';
    public const GRADUATE = 'graduate';
    public const LIGHT_BULB = 'light-bulb';
    public const ENERGY = 'energy';
    public const ICN = 'icn';
    public const ECOLOGY_LEAF = 'ecology-leaf';

    public static function isValid($value): bool
    {
        return \in_array($value, self::getAvailableTypes(), true);
    }

    public static function getAvailableTypes(): array
    {
        return [
            self::GAS_STATION,
            self::BOAT,
            self::EARTH,
            self::TRAVEL,
            self::PASSPORT,
            self::ECONOMY,
            self::PARKING,
            self::COCKTAIL,
            self::RESTAURANT,
            self::FARMER_MARKET,
            self::NETWORK,
            self::MOBILE_PHONE,
            self::COMPANY,
            self::URBANISM,
            self::VILLAGE,
            self::CONSTRUCTION_CONE,
            self::VEGETABLES_PLATE,
            self::GROCERY_SHOPPING,
            self::SHOPPING_BAG,
            self::MEDICAL,
            self::HOSPITAL,
            self::HEALTH,
            self::BICYCLE,
            self::OFFICER,
            self::SURVEILLANCE_CAMERA,
            self::FAMILY_CHILDREN,
            self::FAMILY_WALK_PARK,
            self::FAMILY_CHILD_PLAY_BALL,
            self::BASKETBALL_BALL,
            self::DOG_LEASH,
            self::WATER,
            self::TREE,
            self::PARK_BENCH_LIGHT,
            self::RECYCLE,
            self::BIN,
            self::AGRICULTURE_MACHINE_TRACTOR,
            self::HAND,
            self::SOLIDARITY,
            self::HIERARCHY,
            self::ELDERLY,
            self::PARAPLEGIC,
            self::CAR,
            self::CARPOOLING,
            self::BUS_STATION,
            self::RAILROAD_TRAIN,
            self::BRIEFCASE,
            self::BOOK_FLIP_PAGE,
            self::CULTURE,
            self::OFFICIAL_BUILDING,
            self::GRADUATE,
            self::LIGHT_BULB,
            self::ENERGY,
            self::ICN,
            self::ECOLOGY_LEAF,
        ];
    }

    public static function getAvailableTypesToString(): string
    {
        return implode(' | ', self::getAvailableTypes());
    }
}
