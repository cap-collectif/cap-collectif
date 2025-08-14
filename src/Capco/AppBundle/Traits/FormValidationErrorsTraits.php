<?php

namespace Capco\AppBundle\Traits;

use Symfony\Component\Form\FormInterface;

trait FormValidationErrorsTraits
{
    /**
     * @return array<mixed>
     */
    public function getFormValidationErrors(FormInterface $form): array
    {
        $validationErrors = [];

        if ($form->isSubmitted() && !$form->isValid()) {
            $errors = $form->getErrors(true);
            foreach ($errors as $error) {
                $field = $error->getOrigin()->getName();
                $validationErrors[$field] = $error->getMessageTemplate();
            }
        }

        return $validationErrors;
    }
}
