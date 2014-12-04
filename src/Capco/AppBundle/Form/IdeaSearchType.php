<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

use Capco\AppBundle\Entity\Idea;

class IdeaSearchType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('term', 'search', array(
                'required' => false
            ))
            ->add('sort', 'choice', array(
                'required' => false,
                'choices' => Idea::$openingStatusesLabels,
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'idea.searchform.sort',
                'empty_value' => false,
            ))
            ->add('theme', 'entity', array(
                'required' => false,
                'class' => 'CapcoAppBundle:Theme',
                'property' => 'title',
                'translation_domain' => 'CapcoAppBundle',
                'empty_value' => 'idea.searchform.all_themes',
            ))
        ;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_search';
    }
}
