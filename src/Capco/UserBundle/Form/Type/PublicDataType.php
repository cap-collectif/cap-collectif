<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Entity\UserType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PublicDataType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('twitterUrl', UrlType::class)
            ->add('facebookUrl', UrlType::class)
            ->add('linkedInUrl', UrlType::class)
            ->add('username', PurifiedTextType::class, ['required' => true, 'strip_tags' => true])
            ->add('neighborhood')
            ->add('media')
            ->add('profilePageIndexed', CheckboxType::class, [
                'label_attr' => ['style' => 'font-weight: normal; color: #000000'],
            ])
            ->add('website', UrlType::class)
            ->add('biography', PurifiedTextareaType::class);
        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', EntityType::class, [
                'required' => false,
                'class' => UserType::class,
                'empty_data' => null,
            ]);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['data_class' => User::class]);
    }
}
