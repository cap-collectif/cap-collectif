<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Reporting;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;


class ReportingType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('status', 'choice', array(
                'choices' => Reporting::$openingStatusesLabels,
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'reporting.form.status',
            ))
            ->add('body', 'textarea', array(
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'reporting.form.body'
            ))
        ;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_reporting';
    }
}
