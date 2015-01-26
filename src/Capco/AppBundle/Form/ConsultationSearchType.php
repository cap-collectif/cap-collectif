<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Consultation;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Repository\ThemeRepository;


class ConsultationSearchType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('term', 'search', array(
                'required' => false,
                'label' => 'consultation.searchform.term',
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->add('sort', 'choice', array(
                'required' => false,
                'choices' => Consultation::$sortOrderLabels,
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'consultation.searchform.sort',
                'empty_value' => false,
                'attr' => array('onchange' => 'this.form.submit()')
            ))
            ->add('theme', 'entity', array(
                'required' => false,
                'class' => 'CapcoAppBundle:Theme',
                'property' => 'title',
                'label' => 'consultation.searchform.theme',
                'translation_domain' => 'CapcoAppBundle',
                'query_builder' => function(ThemeRepository $tr) {
                    return $tr->createQueryBuilder('t')
                        ->where('t.isEnabled = :enabled')
                        ->setParameter('enabled', true);
                },
                'empty_value' => 'consultation.searchform.all_themes',
                'attr' => array('onchange' => 'this.form.submit()')
            ))
        ;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_search_consultation';
    }
}
