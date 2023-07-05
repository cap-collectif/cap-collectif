<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Post;
use Capco\MediaBundle\Entity\Media;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;

class ProposalPostType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('translations', TranslationCollectionType::class, [
                'fields' => ['id', 'title', 'body', 'abstract', 'locale'],
            ])
            ->add('title', TextType::class, [
                'label' => 'contact.form.title',
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
                'constraints' => [new NotBlank(['message' => 'contact.title'])],
            ])
            ->add('abstract', TextType::class, [
                'label' => 'contact.form.title',
                'required' => false,
                'purify_html' => false,
                'purify_html_profile' => 'admin',
            ])
            ->add('body', TextType::class, [
                'label' => 'contact.form.body',
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
                'attr' => [
                    'rows' => '10',
                    'cols' => '30',
                ],
                'constraints' => [new NotBlank(['message' => 'contact.no_body'])],
            ])
            ->add('bodyUsingJoditWysiwyg')
            ->add('media', EntityType::class, [
                'class' => Media::class,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Post::class,
            'csrf_protection' => false,
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }
}
