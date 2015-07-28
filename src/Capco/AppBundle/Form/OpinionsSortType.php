<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Entity\Opinion;

class OpinionsSortType extends AbstractType
{
    protected $data;

    public function __construct($data = null)
    {
        $this->data = $data;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $data = [
            'required' => false,
            'choices' => Opinion::$sortCriterias,
            'translation_domain' => 'CapcoAppBundle',
            'label' => 'opinion.sort.label',
            'empty_value' => false,
        ];

        if ($this->data) {
            dump($this->data['defaultFilter']);
            $data = [
                'required' => true,
                'choices' => Opinion::$sortCriterias,
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'opinion.sort.label',
                'data' => $this->data['defaultFilter'],
            ];
        }

        $builder->add('opinionsSort', 'choice', $data);

        if ($this->data) {
            $builder->add('opinionType', 'hidden', array(
                'data' => $this->data['slug'],
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
