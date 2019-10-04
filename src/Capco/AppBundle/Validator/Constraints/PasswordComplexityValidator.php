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
        while ($i < \strlen($password)) {
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
            !$hasDigit ||
            !$hasLowercase ||
            !$hasUppercase ||
            \strlen($password) < self::MIN_PASSWORD_LENGTH
        ) {
            $this->context
                ->buildViolation(
                    $this->getErrorMessage(
                        $hasDigit,
                        $hasUppercase && $hasLowercase,
                        \strlen($password) < self::MIN_PASSWORD_LENGTH
                    )
                )
                ->addViolation();
        }
    }

    public function getErrorMessage(bool $hasDigit, bool $hasUpperLower, bool $length): string
    {
        $sum = ($length ? 0 : 1) + ($hasUpperLower ? 0 : 2) + ($hasDigit ? 0 : 4);
        switch ($sum) {
            case 0:
                return null;
            case 1:
                return 'registration.constraints.password.min';

                break;
            case 2:
                return 'at-least-one-uppercase-one-lowercase';
            case 3:
                return 'at-least-8-characters-one-uppercase-one-lowercase';
            case 4:
                return 'at-least-one-digit';
            case 5:
                return 'at-least-8-characters-one-digit';
            case 6:
                return 'at-least-one-digit-one-uppercase-one-lowercase';
            case 7:
                return 'at-least-8-characters-one-digit-one-uppercase-one-lowercase';
            default:
                return null;
        }
    }
}
