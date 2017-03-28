<?php

namespace Capco\AppBundle\Controller\Api;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Form\ApiToggleType;
use Capco\AppBundle\Form\ApiQuestionType;
use Capco\UserBundle\Form\Type\AdminConfigureRegistrationType;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Post;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\QuestionChoice;

class FeaturesController extends FOSRestController
{
    /**
     * @Put("/toggles/{feature}")
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=200, serializerGroups={})
     */
    public function putFeatureFlagsAction(Request $request, string $feature)
    {
        $toggleManager = $this->container->get('capco.toggle.manager');
        if (!$toggleManager->exists($feature)) {
            throw $this->createNotFoundException(sprintf('The feature "%s" doesn\'t exists.', $feature));
        }
        $form = $this->createForm(new ApiToggleType());
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $data = $form->getData();
        if ($form->getData()['enabled']) {
            $toggleManager->activate($feature);
        } else {
            $toggleManager->deactivate($feature);
        }
    }

    /**
     * @Post("/registration_form/questions")
     * @Security("has_role('ROLE_SUPER_ADMIN')")
     * @View(statusCode=200, serializerGroups={})
     */
    public function postRegistrationQuestionAction(Request $request)
    {
        $form = $this->createForm(new ApiQuestionType());
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->get('doctrine')->getManager();

        $data = $form->getData();
        $question = null;
        if ($data['type'] === '0') {
            $question = new SimpleQuestion();
        }
        if ($data['type'] === '4') {
            $question = new MultipleChoiceQuestion();
            foreach ($data['choices'] as $key => $choice) {
                $questionChoice = new QuestionChoice();
                $questionChoice->setTitle($choice['label']);
                $questionChoice->setPosition($key);
                $question->addQuestionChoice($questionChoice);
            }
        }
        $question->setType((int) $data['type']);
        $question->setTitle($data['question']);
        $question->setRequired($data['required']);

        $abs = new QuestionnaireAbstractQuestion();
        $registrationForm = $em->getRepository('CapcoAppBundle:RegistrationForm')->findCurrent();
        $abs->setRegistrationForm($registrationForm);
        $abs->setQuestion($question);
        $abs->setPosition(0);

        $em->persist($abs);
        $em->flush();

        return $question;
    }

    /**
     * @Put("/registration_form/questions/{id}")
     * @Security("has_role('ROLE_SUPER_ADMIN')")
     * @ParamConverter("question", options={"mapping": {"id": "id"}})
     * @View(statusCode=200, serializerGroups={})
     */
    public function putRegistrationQuestionAction(Request $request, AbstractQuestion $question)
    {
        if ((int) $data['type'] !== $question->getType()) {
          // type has changed we remove and create a new question
          $this->deleteRegistrationQuestionAction($question);
          return $this->postRegistrationQuestionAction($request);
        }

        $form = $this->createForm(new ApiQuestionType());
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->get('doctrine')->getManager();

        $data = $form->getData();
        if ($data['type'] === '4') {
            // Remove previous choices
            $question->resetQuestionChoices();
            foreach ($data['choices'] as $key => $choice) {
                $questionChoice = new QuestionChoice();
                $questionChoice->setTitle($choice['label']);
                $questionChoice->setPosition($key);
                $question->addQuestionChoice($questionChoice);
            }
        }
        $question->setType((int) $data['type']);
        $question->setTitle($data['question']);
        $question->setRequired($data['required']);

        $em->flush();

        return $question;
    }

    /**
     * @Put("/registration_form")
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=200, serializerGroups={})
     */
    public function putRegistrationFormAction(Request $request)
    {
        $em = $this->get('doctrine')->getManager();
        $registrationForm = $em->getRepository('CapcoAppBundle:RegistrationForm')->findCurrent();
        $form = $this->createForm(new AdminConfigureRegistrationType(), $registrationForm);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $em->flush();
    }

    /**
     * @Delete("/registration_form/questions/{id}")
     * @Security("has_role('ROLE_ADMIN')")
     * @ParamConverter("question", options={"mapping": {"id": "id"}})
     * @View(statusCode=200, serializerGroups={})
     */
    public function deleteRegistrationQuestionAction(AbstractQuestion $question)
    {
        $em = $this->get('doctrine')->getManager();
        $em->remove($question);
        $em->flush();
    }
}
