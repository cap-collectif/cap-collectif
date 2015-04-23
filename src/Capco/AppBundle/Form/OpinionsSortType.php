<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Entity\Opinion;

class OpinionsSortType extends AbstractType
{
    protected $opinionType;

    public function __construct($opinionType = null)
    {
        $this->opinionType = $opinionType;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('opinionsSort', 'choice', array(
                'required' => false,
                'choices' => Opinion::$sortCriterias,
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'opinion.sort.label',
                'empty_value' => false,
            ))
        ;

        if (null !== $this->opinionType) {
            $builder->add('opinionType', 'hidden', array(
                'data' => $this->opinionType,
            ));
        }
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_opinions_sort';
    }
}
