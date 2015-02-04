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
        $resolver->setDefaults(array(
            'show_unlink' => true,
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if (!$options['show_unlink']) {
            $builder->add('unlink', 'hidden', array(
                'mapped'   => false,
                'data'     => false,
                'required' => false,
                ))
            ;
        } else {
            $builder->add('unlink', 'checkbox', array(
                'label' => 'media.form.unlink',
                'translation_domain' => 'CapcoAppBundle',
                'mapped'   => false,
                'data'     => false,
                'required' => false,
            ));
        }
        $builder->add('binaryContent', 'file', array(
            'label' => 'media.form.binary_content',
            'translation_domain' => 'CapcoAppBundle',
            'required' => false,
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function getExtendedType()
    {
        return 'sonata_media_type';
    }
}
