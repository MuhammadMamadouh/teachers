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
}
