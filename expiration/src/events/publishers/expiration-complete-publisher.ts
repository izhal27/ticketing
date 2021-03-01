import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@iztickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
