<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ApiProfileFormType;
use Capco\UserBundle\Form\Type\ApiRegistrationFormType;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;

class UsersController extends FOSRestController
{
    /**
     * Get users.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get users",
     *  statusCodes={
     *    200 = "Returned when successful",
     *  }
     * )
     *
     * @Get("/users")
     * @QueryParam(name="type", nullable=true)
     * @QueryParam(name="from", nullable=true)
     * @QueryParam(name="to", nullable=true)
     * @View(serializerGroups={})
     */
    public function getUsersAction(ParamFetcherInterface $paramFetcher)
    {
        $em = $this->getDoctrine()->getManager();
        $type = $paramFetcher->get('type');
        $from = $paramFetcher->get('from');
        $to = $paramFetcher->get('to');
        $userType = null;

        if ($type) {
            $userType = $em->getRepository('CapcoUserBundle:UserType')
                           ->findOneBySlug($type);
            if (!$userType) {
                throw new BadRequestHttpException("This user type doesn't exist, please use a correct slug.");
            }
        }

        $users = $em->getRepository('CapcoUserBundle:User')
                    ->getEnabledWith($userType, $from, $to);

        return [
            'count' => count($users),
        ];
    }

    /**
     * Create a user.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Create a user.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *  }
     * )
     *
     * @Post("/users", defaults={"_feature_flags" = "registration"})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postUserAction(Request $request)
    {
        $userManager = $this->get('fos_user.user_manager');
        $user = $userManager->createUser();
        $form = $this->createForm(ApiRegistrationFormType::class, $user);

        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        // We generate a confirmation token to valdiate email
        $token = $this->get('fos_user.util.token_generator')->generateToken();

        $userManager->updatePassword($user);
        $user->setEnabled(true); // the user can use the website but...
        $user->setExpiresAt((new \DateTime())->modify('+ 3 days')); // the account expires in 3 days (if not confirmed)
        $user->setConfirmationToken($token);
        $this->get('capco.notify_manager')->sendConfirmationEmailMessage($user);

        $userManager->updateUser($user);

        return ['user' => $user];
    }

    /**
     * @Put("/users/me")
     * @Security("has_role('ROLE_USER')")
     * @View(statusCode=200, serializerGroups={})
     */
    public function putMeAction(Request $request)
    {
        $user = $this->getUser();
        $previousPhone = $user->getPhone();

        $form = $this->createForm(ApiProfileFormType::class, $user);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        // If phone is updated we have to make sure it's sms confirmed again
        if ($previousPhone != null && $previousPhone != $user->getPhone()) {
            $user->setPhoneConfirmed(false);
            // TODO: security breach user can send unlimited sms if he change his number
            $user->setSmsConfirmationSentAt(null);
        }

        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * @Post("/resend-email-confirmation", defaults={"_feature_flags" = "registration"})
     * @Security("has_role('ROLE_USER')")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postResendEmailConfirmationAction()
    {
        $user = $this->getUser();
        if ($user->isEmailConfirmed()) {
            throw new BadRequestHttpException('Already confirmed.');
        }
        // security against mass click email resend
        if ($user->getEmailConfirmationSentAt() > (new \DateTime())->modify('- 1 minutes')) {
            throw new BadRequestHttpException('Email already sent less than a minute ago.');
        }

        $this->get('capco.notify_manager')->sendConfirmationEmailMessage($user);
        $user->setEmailConfirmationSentAt(new \DateTime());
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * @Post("/send-sms-confirmation", defaults={"_feature_flags" = "phone_confirmation"})
     * @Security("has_role('ROLE_USER')")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postSendSmsConfirmationAction()
    {
        $user = $this->getUser();
        if ($user->isPhoneConfirmed()) {
            throw new BadRequestHttpException('Already confirmed.');
        }

        if (!$user->getPhone()) {
            throw new BadRequestHttpException('No phone.');
        }

        // security against mass click sms resend
        if ($user->getSmsConfirmationSentAt() && $user->getSmsConfirmationSentAt() > (new \DateTime())->modify('- 3 minutes')) {
            throw new BadRequestHttpException('sms_already_sent_recently');
        }

        try {
            $this->get('sms.service')->confirm($user);
        } catch (\Services_Twilio_RestException $e) {
            $this->get('logger')->error($e->getMessage());
            throw new BadRequestHttpException('sms_failed_to_send');
        }

        $user->setSmsConfirmationSentAt(new \DateTime());
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * @Post("/sms-confirmation", defaults={"_feature_flags" = "phone_confirmation"})
     * @Security("has_role('ROLE_USER')")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postSmsConfirmationAction(Request $request)
    {
        $user = $this->getUser();
        if ($user->isPhoneConfirmed()) {
            throw new BadRequestHttpException('Already confirmed.');
        }

        if (!$user->getSmsConfirmationCode()) {
            throw new BadRequestHttpException('Ask a confirmation message before.');
        }

        if ($request->request->get('code') != $user->getSmsConfirmationCode()) {
            throw new BadRequestHttpException('sms_code_invalid');
        }

        $user->setPhoneConfirmed(true);
        $user->setSmsConfirmationSentAt(null);
        $user->setSmsConfirmationCode(null);
        $this->getDoctrine()->getManager()->flush();
    }
}
