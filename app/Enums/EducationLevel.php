<?php

namespace App\Enums;

enum EducationLevel: string
{
    case PRIMARY = 'ابتدائي';
    case MIDDLE = 'إعدادي';
    case SECONDARY = 'ثانوي';
    case UNIVERSITY = 'جامعي';

    public function label(): string
    {
        return match($this) {
            self::PRIMARY => 'ابتدائي',
            self::MIDDLE => 'إعدادي',
            self::SECONDARY => 'ثانوي',
            self::UNIVERSITY => 'جامعي',
        };
    }

    public function englishLabel(): string
    {
        return match($this) {
            self::PRIMARY => 'Primary',
            self::MIDDLE => 'Middle',
            self::SECONDARY => 'Secondary',
            self::UNIVERSITY => 'University',
        };
    }

    public static function options(): array
    {
        return [
            self::PRIMARY->value => self::PRIMARY->label(),
            self::MIDDLE->value => self::MIDDLE->label(),
            self::SECONDARY->value => self::SECONDARY->label(),
            self::UNIVERSITY->value => self::UNIVERSITY->label(),
        ];
    }

    public static function values(): array
    {
        return [
            self::PRIMARY->value,
            self::MIDDLE->value,
            self::SECONDARY->value,
            self::UNIVERSITY->value,
        ];
    }

    /**
     * Get education levels formatted for frontend components
     */
    public static function forFrontend(): array
    {
        return [
            ['value' => self::PRIMARY->value, 'label' => self::PRIMARY->label()],
            ['value' => self::MIDDLE->value, 'label' => self::MIDDLE->label()],
            ['value' => self::SECONDARY->value, 'label' => self::SECONDARY->label()],
            ['value' => self::UNIVERSITY->value, 'label' => self::UNIVERSITY->label()],
        ];
    }
}
