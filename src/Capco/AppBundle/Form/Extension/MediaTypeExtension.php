<?php

namespace Capco\AppBundle\Form\Extension;

use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\FormBuilderInterface;

class MediaTypeExtension extends AbstractTypeExtension
{
    /**
     * {@inheritdoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'show_unlink' => true,
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if (!$options['show_unlink']) {
            $builder->add('unlink', 'hidden', [
                'mapped'   => false,
                'data'     => false,
                'required' => false,
                ])
            ;
        } else {
            $builder->add('unlink', 'checkbox', [
                'label'              => 'media.form.unlink',
                'translation_domain' => 'CapcoAppBundle',
                'mapped'             => false,
                'data'               => false,
                'required'           => false,
            ]);
        }
        $builder
            ->add('binaryContent', 'file', [
                'label'              => 'media.form.binary_content',
                'translation_domain' => 'CapcoAppBundle',
                'required'           => false,
            ])
            ->remove('contentType')
        ;
    }

    /**
     * {@inheritdoc}
     */
    public function getExtendedType()
    {
        return 'sonata_media_type';
    }
}
