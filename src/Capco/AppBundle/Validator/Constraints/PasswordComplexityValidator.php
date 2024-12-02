<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class PasswordComplexityValidator extends ConstraintValidator
{
    private const MIN_PASSWORD_LENGTH = 8;

    public function validate($password, Constraint $constraint)
    {
        $hasDigit = false;
        $hasUppercase = false;
        $hasLowercase = false;

        $i = 0;
        while ($i < \strlen((string) $password)) {
            $character = \ord($password[$i]);
            // Check if character is a digit
            if ($character > 47 && $character < 58) {
                $hasDigit = true;
            } else {
                // Check if character is uppercase
                if ($character > 64 && $character < 91) {
                    $hasUppercase = true;
                }
                // Check if character is lowercase
                if ($character > 96 && $character < 123) {
                    $hasLowercase = true;
                }
            }
            ++$i;
        }

        if (
            !$hasDigit
            || !$hasLowercase
            || !$hasUppercase
            || \strlen((string) $password) < self::MIN_PASSWORD_LENGTH
        ) {
            $this->context
                ->buildViolation(
                    $this->getErrorMessage(
                        $hasDigit,
                        $hasUppercase && $hasLowercase,
                        \strlen((string) $password) >= self::MIN_PASSWORD_LENGTH
                    )
                )
                ->addViolation()
            ;
        }
    }

    public function getErrorMessage(bool $hasDigit, bool $hasUpperLower, bool $length): ?string
    {
        $sum = ($length ? 0 : 1) + ($hasUpperLower ? 0 : 2) + ($hasDigit ? 0 : 4);

        return match ($sum) {
            0 => null,
            1 => 'registration.constraints.password.min',
            2 => 'at-least-one-uppercase-one-lowercase',
            3 => 'at-least-8-characters-one-uppercase-one-lowercase',
            4 => 'at-least-one-digit',
            5 => 'at-least-8-characters-one-digit',
            6 => 'at-least-one-digit-one-uppercase-one-lowercase',
            7 => 'at-least-8-characters-one-digit-one-uppercase-one-lowercase',
            default => null,
        };
    }
}
