<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SearchType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Entity\Theme;

class ThemeSearchType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('term',
                SearchType::class, [
                'label' => 'theme.search.term',
                'translation_domain' => 'CapcoAppBundle',
                'required' => false,
            ])
        ;
    }
}
