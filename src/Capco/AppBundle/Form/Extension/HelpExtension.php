<?php

namespace Capco\AppBundle\Form\Extension;

use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

class HelpExtension extends AbstractTypeExtension
{
    public function getExtendedType(): string
    {
        return FormType::class;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['help' => null]);
    }

    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $view->vars = array_merge($view->vars, ['help' => $options['help']]);
    }
}
