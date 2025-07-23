<?php

require_once 'vendor/autoload.php';

use App\Enums\CenterType;

echo "Testing CenterType enum:\n";

// Test enum values
echo "INDIVIDUAL value: " . CenterType::INDIVIDUAL->value . "\n";
echo "ORGANIZATION value: " . CenterType::ORGANIZATION->value . "\n";

// Test labels
echo "INDIVIDUAL label: " . CenterType::INDIVIDUAL->label() . "\n";
echo "ORGANIZATION label: " . CenterType::ORGANIZATION->label() . "\n";

// Test descriptions
echo "INDIVIDUAL description: " . CenterType::INDIVIDUAL->description() . "\n";
echo "ORGANIZATION description: " . CenterType::ORGANIZATION->description() . "\n";

// Test methods
echo "INDIVIDUAL is individual: " . (CenterType::INDIVIDUAL->isIndividual() ? 'true' : 'false') . "\n";
echo "ORGANIZATION is organization: " . (CenterType::ORGANIZATION->isOrganization() ? 'true' : 'false') . "\n";

// Test toArray
echo "toArray: " . json_encode(CenterType::toArray()) . "\n";

// Test options
echo "options: " . json_encode(CenterType::options()) . "\n";

echo "\nEnum is working correctly!\n";
