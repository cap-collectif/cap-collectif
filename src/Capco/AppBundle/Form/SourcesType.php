<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Source;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Validator\Constraints\True;

class SourcesType extends AbstractType
{
    protected $action;

    function __construct($action)
    {
        $this->action = $action;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($this->action === 'edit') {
            $builder
                ->add('confirm', 'checkbox', array(
                    'mapped' => false,
                    'label' => 'source.form.confirm',
                    'required' => true,
                    'constraints' => [new True(['message' => 'source.votes_not_confirmed'])]
                ))
            ;
        }

        $builder
            ->add('title', 'text', array(
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'source.form.title',
            ))
            ->add('body', 'textarea', array(
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'source.form.body',
            ))
            ->add('Category', null, array(
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'source.form.category',
            ))
            ->add('type', 'choice', array(
                'choices' => Source::$TypesLabels,
                'label' => 'source.form.type',
                'translation_domain' => 'CapcoAppBundle',
                'multiple' => false,
                'expanded' => true,
                'label' => false,
            ))
            ->add('link', 'url', array(
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'source.form.link',
                'attr' => array('placeholder' => 'http://'),
                'default_protocol' => 'http',
            ))
            ->add('media', 'sonata_media_type', array(
                'provider' => 'sonata.media.provider.file',
                'context' => 'sources',
                'required' => false,
                'cascade_validation' => true,
                'label' => 'source.form.file',
                'translation_domain' => 'CapcoAppBundle',
//                'attr' => array('class' => 'media', 'style' => 'display:none')
            ))
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Capco\AppBundle\Entity\Source',
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'validation_groups' => function (FormInterface $form) {
                $data = $form->getData();
                if ($data->getType() == 0) {
                    return ['Default', 'link'];
                } else {
                    return ['Default', 'file'];
                }
            },

        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_source';
    }
}
