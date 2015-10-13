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
            'label' => false,
            'empty_value' => false,
        ];

        if ($this->data) {
            $data['required'] = true;
            $data['data'] = $this->data['defaultFilter'];
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
        return 'capco_app_opinions_sort_'.$this->data['id'];
    }
}
