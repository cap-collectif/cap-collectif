<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Enum\EmailingCampaignInternalList;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;

class EmailingCampaignType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', PurifiedTextType::class, [
                'required'=> true,
                'purify_html' => true,
                'strip_tags' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('senderEmail', EmailType::class, [
                'required' => true
            ])
            ->add('senderName', PurifiedTextType::class, [
                'required'=> true,
                'purify_html' => true,
                'strip_tags' => true,
                'purify_html_profile' => 'default',
            ])
            ->add('mailingList', EntityType::class, [
                'class' => MailingList::class,
                'required' => false
            ])
            ->add('mailingInternal', ChoiceType::class, [
                'choices' => EmailingCampaignInternalList::ALL,
                'required' => false
            ])
            ->add('object', PurifiedTextType::class, [
                'required'=> false,
                'purify_html' => true,
                'strip_tags' => true,
                'purify_html_profile' => 'default',
                'empty_data' => ''
            ])
            ->add('content', TextType::class, [
                'required' => false,
                'empty_data' => ''
            ])
            ->add('sendAt', DateTimeType::class, [
                'required' => false,
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
            ])
        ;
    }
}
