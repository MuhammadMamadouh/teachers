<?php

namespace App\Enums;

enum CenterType: string
{
    case INDIVIDUAL = 'individual';
    case ORGANIZATION = 'organization';

    /**
     * Get the label for the center type in Arabic.
     */
    public function label(): string
    {
        return match ($this) {
            self::INDIVIDUAL => 'فردي',
            self::ORGANIZATION => 'مؤسسة',
        };
    }

    /**
     * Get the description for the center type in Arabic.
     */
    public function description(): string
    {
        return match ($this) {
            self::INDIVIDUAL => 'مركز فردي لمعلم واحد',
            self::ORGANIZATION => 'مؤسسة تعليمية متعددة المعلمين',
        };
    }

    /**
     * Get all center types as an array.
     */
    public static function toArray(): array
    {
        return [
            self::INDIVIDUAL->value => self::INDIVIDUAL->label(),
            self::ORGANIZATION->value => self::ORGANIZATION->label(),
        ];
    }

    /**
     * Get all center types for select options.
     */
    public static function options(): array
    {
        $options = [];
        foreach (self::cases() as $case) {
            $options[] = [
                'value' => $case->value,
                'label' => $case->label(),
                'description' => $case->description(),
            ];
        }
        return $options;
    }

    /**
     * Check if center type is individual.
     */
    public function isIndividual(): bool
    {
        return $this === self::INDIVIDUAL;
    }

    /**
     * Check if center type is organization.
     */
    public function isOrganization(): bool
    {
        return $this === self::ORGANIZATION;
    }
}
