<?php

namespace Capco\AppBundle\GraphQL\Exceptions;

use Overblog\GraphQLBundle\Error\UserErrors;
use Symfony\Component\Form\FormInterface;

class GraphQLException extends UserErrors
{
    public function __construct(
        array $errors,
        $message = '',
        $code = 0,
        ?\Exception $previous = null
    ) {
        parent::__construct($errors, $message, $code, $previous);
    }

    public static function fromString($message)
    {
        return new self([$message]);
    }

    public static function fromFormErrors(FormInterface $form)
    {
        return new self(self::getPlainErrors($form));
    }

    public static function getPlainErrors($form)
    {
        $errors = [];

        foreach ($form->getErrors() as $key => $error) {
            $errors[] = $error->getMessage();
        }

        foreach ($form->all() as $child) {
            if ($child->isSubmitted() && !$child->isValid()) {
                $errors = array_merge($errors, static::getPlainErrors($child));
            }
        }

        return $errors;
    }
}
